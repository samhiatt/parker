/**
 * Created by sam on 12/6/15.
 */

/*
 A schedule representing a time period repeating every specified day of week 
 and (optionally) each specified week of the month. 
 TODO: include holiday exceptions (find list of holidays)
 */
import moment = require('moment');
require('moment-range');
require('moment-timezone');

//var Months:{[monthName:string]:number} = {
//	jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sept: 8, oct: 9, nov: 10, dec: 11,
//	january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8, 
//	october: 9, november: 10, december: 11,
//};
var DaysOfWeek:{[dayName:string]:number} = {
	sun: 0, mon: 1, tues: 2, weds: 3, thurs: 4, fri: 5, sat: 6
};

export class Schedule{
	startHour:number;
	endHour:number;
	timezone:string;
	daysOfWeek:number[];
	weeksOfMonth:number[];
	holidays:boolean;
	constructor(
		startHour:number, 
		endHour:number, 
		daysOfWeek:any[], 
		weeksOfMonth:number[],
	  timezone:string="America/Los_Angeles",
	  holidays=true
	){
		this.startHour = startHour;
		this.endHour = endHour;
		this.daysOfWeek = (typeof daysOfWeek[0]=='string')? daysOfWeek.map(function(dow:string){
			return DaysOfWeek[dow.toLowerCase()] }) : daysOfWeek;
		this.weeksOfMonth = weeksOfMonth? weeksOfMonth : [1,2,3,4,5];
		this.timezone = timezone;
		this.holidays = holidays;
	}
	
	/* 
	 * Get the next scheduled event, starting from fromMoment (default now).
	 */
	nextEvent(
			fromMoment?:moment.Moment
	):moment.Range{
		if (!fromMoment) fromMoment = moment().tz(this.timezone).local();
		else if (fromMoment instanceof Date)
			fromMoment = moment(fromMoment.toISOString()).local();
		else if( typeof fromMoment == 'string') 
			fromMoment = moment.tz(fromMoment,this.timezone).local();
		var self = this;
		
		function checkDay(date:moment.Moment):boolean{
			var weekOfMonth = Math.floor((date.date()-1)/7)+1;
			//console.log(date.toLocaleString(),weekOfMonth);
			if (self.daysOfWeek.indexOf(date.day())==-1) return false;
			if (self.weeksOfMonth.indexOf(weekOfMonth)==-1) return false;
			var endTime = date.clone().set({hour:self.endHour,minute:0,second:0});
			//console.log("end", endTime.toLocaleString());
			return (fromMoment<endTime);
		};

		var nextStart = fromMoment.clone();
		
		while (!checkDay(nextStart)) nextStart.date(nextStart.date()+1);
		nextStart.set({hour:this.startHour,minute:0,second:0});
		var nextEnd = nextStart.clone().set({hours:this.endHour});
		//console.log("returning",nextStart.toLocaleString(),nextEnd.toLocaleString());
		
		return moment.range(nextStart,nextEnd);
		
	}
} 