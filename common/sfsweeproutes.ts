import Feature = GeoJSON.Feature;
import Point = GeoJSON.Point;

import schedule = require('./schedule');
import FeatureGroup = L.FeatureGroup;
import LayerGroup = L.LayerGroup;
import FeatureCollection = GeoJSON.FeatureCollection;
import GeometryObject = GeoJSON.GeometryObject;
import {Stream} from "stream";

var _ = require('lodash');

export class SweepScheduleProperties {
	week1ofmon:string|boolean;
	week2ofmon:string|boolean;
	week3ofmon:string|boolean;
	week4ofmon:string|boolean;
	week5ofmon:string|boolean;
	weekday: string;
	blockside: string;
	fromhour: string;
	tohour: string;
	streetname: string;
	nhood: string;
	zip_code: number;
	cnnrightle: string;
	holidays: string;
	//nearest_point: Point;
	distance: number;
	
	constructor(properties?:any){
		
	}
}

export class StreetSection implements Feature {
	type:string="Feature";
	geometry:GeometryObject;
	properties:{
		schedules: {[streetSide:string]:schedule.Schedule};
		streetName: string;
		neighborhood: string;
		distanceFromPoint: number;
		leftSideAddressStart: number;
		leftSideAddressEnd: number;
		rightSideAddressStart: number;
		rightSideAddressEnd: number;
		bestGuess?: string;
	};
	constructor(feature:Feature){
		this.geometry = feature.geometry;
		var schedules:{[blockSide:string]:schedule.Schedule}={};
		if (feature.properties.schedules) schedules = feature.properties.schedules;
		else {
			let blockSide = (feature.properties.blockside)? feature.properties.blockside : 'both';
			schedules[blockSide]=createSchedule(feature.properties);
		}
		this.properties = {
			schedules: schedules,
			streetName: feature.properties.streetname || feature.properties.streetName,
			neighborhood: feature.properties.nhood || feature.properties.neighborhood,
			distanceFromPoint: feature.properties.distance || feature.properties.distanceFromPoint,
			leftSideAddressStart: feature.properties.lf_fadd || feature.properties.leftSideAddressStart,
			leftSideAddressEnd: feature.properties.lf_toadd || feature.properties.leftSideAddressEnd,
			rightSideAddressStart: feature.properties.rt_fadd || feature.properties.rightSideAddressStart,
			rightSideAddressEnd: feature.properties.rt_toadd || feature.properties.rightSideAddressEnd
		};
	}
	/*
	 * Considers features to match if the distance, streetname, and address ranges are all equal.
	 */
	matches(feature:Feature):boolean{
		if (!feature) return false;
		//feature = new StreetSection(feature);
		return (
				this.properties.distanceFromPoint == feature.properties.distanceFromPoint
				&& this.properties.streetName == feature.properties.streetName
				&& this.properties.leftSideAddressStart == feature.properties.leftSideAddressStart
				&& this.properties.leftSideAddressEnd == feature.properties.leftSideAddressEnd
				&& this.properties.rightSideAddressStart == feature.properties.rightSideAddressStart
				&& this.properties.rightSideAddressEnd == feature.properties.rightSideAddressEnd
		);
	}
	merge(feature:Feature):StreetSection{
		var newSchedule:{[blockSide:string]:schedule.Schedule}={};
		if (feature.properties.blockside) newSchedule[feature.properties.blockside] = createSchedule(feature.properties);
		else newSchedule = feature.properties.schedules;
		for (var blockSide in newSchedule) {
			if (this.properties.schedules.hasOwnProperty(blockSide)){ // merge daysOfWeek
				this.properties.schedules[blockSide].addDaysOfWeek(newSchedule[blockSide].daysOfWeek);
			} else {
				this.properties.schedules[blockSide]=newSchedule[blockSide];
			}
		}
		
		return this;
	}
}

export class SweepScheduleFeatureGroup implements FeatureCollection {
	type:string='FeatureCollection';
	features:StreetSection[]=[];
	constructor(features?:Feature[]){
		if (features) features.forEach(feature=>this.merge(feature));
	}
	merge(feature:Feature):StreetSection{
		var section = new StreetSection(feature);
		for (var i=0; i<this.features.length; i++){
			if (this.features[i].matches(section)) return this.features[i].merge(section);
		}
		this.features.push(section);
		return section;
	}
}

/*
 * Create Schedule obj from feature properties.
 */
export function createSchedule(properties:SweepScheduleProperties):schedule.Schedule{
	var weeks:number[]=[];
	if (properties.week1ofmon=='Y'||properties.week1ofmon==true) weeks.push(1);
	if (properties.week2ofmon=='Y'||properties.week2ofmon==true) weeks.push(2);
	if (properties.week3ofmon=='Y'||properties.week3ofmon==true) weeks.push(3);
	if (properties.week4ofmon=='Y'||properties.week4ofmon==true) weeks.push(4);
	if (properties.week5ofmon=='Y'||properties.week5ofmon==true) weeks.push(5);
	var daysOfWeek = (properties.weekday=='Holiday' || properties.weekday=='')? 
		['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : [properties.weekday]; // TODO: verify what 'Holday' or '' means
	var sched:schedule.Schedule = new schedule.Schedule(properties.fromhour,properties.tohour,daysOfWeek, weeks);
	sched.nextSweeping = sched.next();
	return sched;
}