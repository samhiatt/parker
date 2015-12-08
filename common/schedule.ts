/**
 * Created by sam on 12/6/15.
 */

/*
 A schedule representing a time period repeating every specified day of week 
 and (optionally) each specified week of the month. 
 TODO: include holiday exceptions (find list of holidays)
 */
import Range = moment.Range;
import Moment = moment.Moment;
var moment = require('moment');
require('moment-range');
require('moment-timezone');

//var Months:{[monthName:string]:number} = {
//	jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sept: 8, oct: 9, nov: 10, dec: 11,
//	january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8, 
//	october: 9, november: 10, december: 11,
//};
var DaysOfWeek:any = {
	sun: 0, mon: 1, tue: 2, tues: 2, wed: 3, weds: 3, thu: 4, thurs: 4, fri: 5, sat: 6,
	'0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat'
};

function getHrsMins(hrsMinsStr:string):{hours:number,minutes:number,seconds:number}{
	var hrsMinsArr = hrsMinsStr.split(':');
	return {
		hours: parseInt(hrsMinsArr[0]),
		minutes: (hrsMinsArr.length>1)? parseInt(hrsMinsArr[1]) : 0,
		seconds: 0
	};
}

export class Schedule{
	_startHour:{hours:number,minutes:number,seconds:number};
	_endHour:{hours:number,minutes:number,seconds:number};
	_daysOfWeek:number[];
	startHour:string;
	endHour:string;
	timezone:string;
	daysOfWeek:string[];
	weeksOfMonth:number[];
	holidays:boolean;
	nextSweeping:Range;
	constructor(
		startHour:string, 
		endHour:string, 
		daysOfWeek:any[], 
		weeksOfMonth:number[],
	  timezone:string="America/Los_Angeles",
	  holidays=true
	){
		this.startHour = startHour;
		this.endHour = endHour;
		this._startHour = getHrsMins(startHour);
		this._endHour = getHrsMins(endHour);
		this._daysOfWeek = (typeof daysOfWeek[0]=='string')? daysOfWeek.map(function(dow:string){
			return DaysOfWeek[dow.toLowerCase()] }) : daysOfWeek;
		this.daysOfWeek = this._daysOfWeek.map(function(dow:number){ return DaysOfWeek[dow] });
		this.weeksOfMonth = weeksOfMonth? weeksOfMonth : [1,2,3,4,5];
		this.timezone = timezone;
		this.holidays = holidays;
	}
	
	toJSON():any{
		if (!this.nextSweeping) this.nextSweeping = this.next();
		return {
			startHour: this.startHour,
			endHour: this.endHour,
			daysOfWeek: this.daysOfWeek,
			weeksOfMonth: this.weeksOfMonth,
			timezone: this.timezone,
			holidays: this.holidays,
			nextSweeping: this.nextSweeping
		};
	}
	
	addDaysOfWeek(days:string[]):void{
		days.forEach((day:string)=>{
			var dayInt:number = DaysOfWeek[day.toLowerCase()];
			if (this._daysOfWeek.indexOf(dayInt)==-1) this._daysOfWeek.push(dayInt);
		});
		// re-construct daysOfWeek
		this.daysOfWeek=this._daysOfWeek.map(day=>{
			return DaysOfWeek[day.toString()];
		});
	}
	
	/* 
	 * Get the next scheduled event, starting from fromMoment (default now).
	 */
	next(
			fromMoment?:Moment
	):Range{
		if (!fromMoment) fromMoment = moment().tz(this.timezone).local();
		else if (fromMoment instanceof Date)
			fromMoment = moment(fromMoment.toISOString()).local();
		else if( typeof fromMoment == 'string') 
			fromMoment = moment.tz(fromMoment,this.timezone).local();
		var self = this;
		
		function checkDay(date:Moment):boolean{
			var weekOfMonth = Math.floor((date.date()-1)/7)+1;
			//console.log("CT:",ct,date.toLocaleString(),weekOfMonth,self._startHour.hours,self._endHour.hours,"today",self.daysOfWeek);
			if (self._daysOfWeek && self._daysOfWeek.indexOf(date.day())==-1) return false;
			if (self.weeksOfMonth && self.weeksOfMonth.indexOf(weekOfMonth)==-1) return false;
			var endTime = date.clone().set(self._endHour);
			//console.log("end", endTime.toLocaleString());
			return (fromMoment<endTime);
		};

		var nextStart = fromMoment.clone();
		
		var ct = 0;
		while (!checkDay(nextStart) && ct++<31) nextStart.date(nextStart.date()+1);
		nextStart.set(this._startHour);
		var nextEnd = nextStart.clone().set(this._endHour);
		//console.log("returning",nextStart.toLocaleString(),nextEnd.toLocaleString());
		
		return moment.range(nextStart,nextEnd);
		
	}
} 