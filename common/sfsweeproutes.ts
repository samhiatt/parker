//importport Schedule =require("./schedule");
import Feature = GeoJSON.Feature;
import Point = GeoJSON.Point;

import schedule = require('./schedule');
//import {Schedule} from "./schedule";

export interface ISFSweepRoutesProperties {
	week1ofmon:string,
	week2ofmon:string,
	week3ofmon:string,
	week4ofmon:string,
	week5ofmon:string,
	weekday: string,
	blockside: string,
	fromhour: string,
	tohour: string,
	streetname: string,
	nhood: string,
	zip_code: number,
	cnnrightle: string,
	holidays: string,
	//nearest_point: Point,
	distance: number
}

export interface IScheduleProperties {
	schedules: {[streetSide:string]:schedule.Schedule},
	streetName: string,
	neighborhood: string,
	distanceFromPoint: number
}

/*
 * Create Schedule obj from feature properties.
 */
export function createSchedule(properties:ISFSweepRoutesProperties){
	var weeks:number[]=[];
	if (properties.week1ofmon=='Y') weeks.push(1);
	if (properties.week2ofmon=='Y') weeks.push(2);
	if (properties.week3ofmon=='Y') weeks.push(3);
	if (properties.week4ofmon=='Y') weeks.push(4);
	if (properties.week5ofmon=='Y') weeks.push(5);
	var daysOfWeek = (properties.weekday=='Holiday' || properties.weekday=='')? 
		['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : [properties.weekday]; // TODO: verify what 'Holday' or '' means
	var sched:schedule.Schedule = new schedule.Schedule(properties.fromhour,properties.tohour,daysOfWeek, weeks);
	sched.nextEvent = sched.next();
	return sched;
}
/*
 * Considers features to be the same if the distance, streetname, and address ranges are all equal.
 */
function compareFeatures(featureA:Feature, featureB:Feature):boolean{
	var propsA = featureA.properties;
	var propsB = featureB.properties;
	return (
		propsA.distance == propsB.distance
		&& propsA.streetname == propsB.streetname
		&& propsA.lf_fadd == propsB.lf_fadd
		&& propsA.lf_toadd == propsB.lf_toadd
		&& propsA.rt_fadd == propsB.rt_fadd
		&& propsA.rt_toadd == propsB.rt_toadd
	);
}
export function combineAndTransformFeatures(features:Feature[]):Feature[]{
	function getBlockSide(blockside:string):string{
		if (blockside=='') return 'both';
		else return blockside;
	}
	// Sort by distance so that we can assume identical geoms are adjacent to each other.
	features.sort((a:Feature, b:Feature):number=>{
		if (a.properties.distance > b.properties.distance) return 1;
		else if (a.properties.distance < b.properties.distance) return -1;
		else return 0;
	});
	var res:Feature[] = [];
	for (var i=1; i < features.length; i++){
		var schedules:{[streetSide:string]:schedule.Schedule} = {};
		if (compareFeatures(features[i],features[i-1])) {
			schedules[getBlockSide(features[i].properties.blockside)]= createSchedule(features[i].properties);
			schedules[getBlockSide(features[i-1].properties.blockside)]= createSchedule(features[i-1].properties);
			res.push({
				type:"Feature",
				geometry: features[i].geometry,
				properties: {
					schedules: schedules,
					streetName: features[i].properties.streetname,
					neighborhood: features[i].properties.nhood,
					distanceFromPoint: features[i].properties.distance 
				}
			});
			i++; // Jump ahead 
		} else { // assume no match. Add to res anyway.
			schedules[getBlockSide(features[i-1].properties.blockside)]= createSchedule(features[i-1].properties);
			res.push({
				type:"Feature",
				geometry: features[i-1].geometry,
				properties: {
					schedules: schedules,
					streetName: features[i-1].properties.streetname,
					neighborhood: features[i-1].properties.nhood,
					distanceFromPoint: features[i-1].properties.distance
				}
			});
		}
	}
	return res;
}