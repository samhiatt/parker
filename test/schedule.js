/**
 * Created by sam on 12/6/15.
 */

var assert = require('assert');
var moment = require('moment');

describe('schedule', function() {
  var Schedule = require('../common/schedule').Schedule;
  
  describe('timezones',function(){
    var schedule = new Schedule(12,14,[2,4]);
    it('checks default timezone=="America/Los_Angeles"', function () {
      assert.equal(schedule.timezone,'America/Los_Angeles');
    });
    it('checks setting alternative timezone', function () {
      var schedule = new Schedule(12,14,[2,4],null,'America/New_York');
      assert.equal(schedule.timezone,'America/New_York');
    });
  });
  
  describe('check events', function () {
    function checkEvent(event, date) {
      it('is after specified date', function () {
        assert.equal(event.end >= date, true);
      });
      it('start is before end', function () {
        assert.equal(event.start < event.end, true);
      });
    }
    describe('test date input formats',function(){
        
      var schedule = new Schedule(5, 7, [2, 4]);
  
      describe('next event from now', function () {
        var nextEvent = schedule.nextEvent(null);
        checkEvent(nextEvent, moment());
      });
      describe("nextEvent('2015-01-01')", function () {
        var nextEvent = schedule.nextEvent('2015-01-01');
        checkEvent(nextEvent, moment('2015-01-01'));
        it('should be year 2015',function() {
          assert.equal(nextEvent.start.year(), 2015);
        });
      });
      describe("nextEvent('2015-12-31 12:00')", function () {
        var nextEvent = schedule.nextEvent('2015-12-31 12:00');
        checkEvent(nextEvent, moment('2015-12-31 12:00','America/Los_Angeles'));
        it('should be year 2016',function() {
          assert.equal(nextEvent.start.year(), 2016);
        });
      });
      describe("nextEvent(new Date('2015-12-31Z'))", function () {
        var date = new Date('2015-01-01Z');
        var nextEvent = schedule.nextEvent(date);
        checkEvent(nextEvent, date);
        it('should be year 2015',function() {
          assert.equal(nextEvent.start.year(), 2015);
        });
      });
    });
    describe('test schedules',function() {
      describe('1st and 3rd Mon and Weds, from 5am to 7am', function () {
        // 2, 7, 16, 21
        var schedule = new Schedule(5, 7, ['Mon','Weds'], [1, 3]);
        describe('test from Dec 1st', function () {
          var date = moment('2015-12-01T03:00');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2015-12-02 05:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2015-12-02T05:00').toLocaleString());
          });
        });
        describe('test from Dec 4th', function () {
          var date = moment('2015-12-04T03:00');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2015-12-07 05:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2015-12-07T05:00').toLocaleString());
          });
        });
      });
      describe('2nd and 4th Mon and Weds, from 5am to 7am', function () {
        // 9, 14, 23, 28
        var schedule = new Schedule(5, 7, ['Mon','Weds'], [2, 4]);
        describe('test from Dec 1st', function () {
          var date = moment('2015-12-01T03:00');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2015-12-09 5:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2015-12-09T05:00').toLocaleString());
          });
        });
        describe('test from Dec 15th', function () {
          var date = moment('2015-12-15');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2015-12-23 5:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2015-12-23T05:00').toLocaleString());
          });
        });
        describe('test from Dec 23rd at 6AM', function () {
          var date = moment('2015-12-23T06:00');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2015-12-23 5:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2015-12-23T05:00').toLocaleString());
          });
        });
        describe('test from Dec 31st', function () {
          // Jan 11, 13, 25, 27
          var date = moment('2015-12-31');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2016-01-11 5:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2016-01-11T05:00').toLocaleString());
          });
        });
      });
      describe('1st and 3rd Tues and Thurs, from 7am to 9am', function () {
        // 1, 3, 15, 17
        var schedule = new Schedule(7, 9, ['Tues','Thurs'], [1, 3]);
        describe('test from Dec 1st', function () {
          var date = moment('2015-12-01T03:00');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2015-12-01 7:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2015-12-01T07:00').toLocaleString());
          });
        });
        describe('test from Dec 15th', function () {
          var date = moment('2015-12-15');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2015-12-15 7:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2015-12-15T07:00').toLocaleString());
          });
        });
        describe('test from Dec 23rd at 6AM', function () {
          var date = moment('2015-12-23T06:00');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2016-01-05 7:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2016-01-05T07:00').toLocaleString());
          });
        });
        describe('test from Dec 31st', function () {
          // Jan 5, 7, 19, 21
          var date = moment('2015-12-31');
          var nextEvent = schedule.nextEvent(date);
          checkEvent(nextEvent, date);
          it('should start at 2016-01-05 7:00AM', function () {
            assert.equal(nextEvent.start.toLocaleString(), moment('2016-01-05T07:00').toLocaleString());
          });
        });
      });
    });
  });
});

