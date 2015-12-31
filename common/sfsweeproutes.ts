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
	distance: number;
	
	constructor(properties?:any){
		
	}
}

var DirectionsDict:{[dir:string]:string} = {
	N:"North",NW:"NorthWest",W:"West",SW:"Southwest",S:"South",SE:"SouthEast",E:"East",NE:"NorthEast"
};

export interface IStreetSectionProps {
	schedules: {[streetSide:string]:schedule.Schedule};
	streetName: string;
	neighborhood: string;
	distanceFromPoint: number;
	leftSideAddressStart: string;
	leftSideAddressEnd: string;
	rightSideAddressStart: string;
	rightSideAddressEnd: string;
	guessedStreetSide?: string;
	nearest?:boolean;
}

export class StreetSection implements Feature {
	type:string="Feature";
	geometry:GeometryObject;
	properties:IStreetSectionProps;
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
	/*
	 * Given the direction the car is facing (in degrees), return the street side for the sweeping schedule.
	 * Will return one of
	 */
	getStreetSide(heading:number):string{
		var rightDoorFaces:string;
		heading += 90; // 90 degree offset to point towards curb
		if (heading >= 360) heading = 0;
		if (heading >= 0  && heading < 90) rightDoorFaces = 'NorthEast';
		else if (heading >= 90 && heading < 180) rightDoorFaces = 'SouthEast';
		else if (heading >= 180 && heading < 270) rightDoorFaces = 'SouthWest';
		else if (heading >=270 && heading < 360) rightDoorFaces = 'NorthWest';
		//if ((heading >= 315 && heading < 360)||(heading >= 0  && heading < 45)) rightDoorFaces = 'North';
		//else if (heading >= 45 && heading < 135) rightDoorFaces = 'East';
		//else if (heading >= 135 && heading < 225) rightDoorFaces = 'South';
		//else if (heading >=225 && heading < 315) rightDoorFaces = 'West';
		
		console.log(rightDoorFaces);
		
		for (var side in this.properties.schedules) {
			if (this.properties.schedules.hasOwnProperty(side)) {
				if (side == rightDoorFaces
						|| side.indexOf(rightDoorFaces) > -1
						|| rightDoorFaces.indexOf(side) > -1
				) return side;
				else if (rightDoorFaces.length > 5) {
					if (side.indexOf(rightDoorFaces.slice(0, 5)) > -1
							|| side.indexOf(rightDoorFaces.slice(5)) > -1
					) return side;
				}
			}
		}
		return 'both'; // Default to both sides
	}
}

export class SweepScheduleFeatureGroup implements FeatureCollection {
	type:string='FeatureCollection';
	features:StreetSection[]=[];
	//nearest: StreetSection;
	constructor(features?:Feature[]){
		if (features) features.forEach(feature=>this.merge(feature));
	}
	merge(feature:Feature):StreetSection{
		var section = new StreetSection(feature);
		for (var i=0; i<this.features.length; i++){
			if (this.features[i].matches(section)) {
				//if (!this.nearest || this.nearest.properties.distanceFromPoint<section.properties.distanceFromPoint) {}
				//	this.nearest = section;
				return this.features[i].merge(section);
			}
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