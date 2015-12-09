/**
 * Created by sam on 12/6/15.
 */

var assert = require('assert');
var sfs = require('../common/sfsweeproutes');

var feature = {
  geometry:{
    coordinates:[-124.44, 37.77]
  },
  properties:{
    week1ofmon:'Y', week2ofmon:'Y', week3ofmon:'Y', week4ofmon:'Y', week5ofmon:'Y', weekday: 'Mon',
    blockside: 'West', fromhour: '09:00', tohour: '12:00', streetname: 'Cayuga Ave', nhood: 'Excelsior',
    zip_code: 94112, cnnrightle: 'R', holidays: 'N', distance: 135, lf_fadd:1, lf_toadd:1, rt_fadd:1, rt_toadd:1
  }
};
var feature2 = {
  geometry:{
    coordinates:[-124.44, 37.77]
  },
  properties:{
    week1ofmon:'Y', week2ofmon:'Y', week3ofmon:'Y', week4ofmon:'Y', week5ofmon:'Y', weekday: 'Weds',
    blockside: 'East', fromhour: '09:00', tohour: '12:00', streetname: 'Cayuga Ave', nhood: 'Excelsior',
    zip_code: 94112, cnnrightle: 'L', holidays: 'N', distance: 135, lf_fadd:1, lf_toadd:1, rt_fadd:1, rt_toadd:1
  }
};

describe('sfsweeproutes', function() {
  describe('StreetSection',function(){
    var section = new sfs.StreetSection(feature);
    describe('constructor(feature)',function(){
      it('instantiates a new StreetSection from a sfsweeproute feature', function () {
        console.log(JSON.stringify(section));
        assert.equal(section.properties.streetName,'Cayuga Ave');
        assert.equal(section.properties.schedules.West.startHour,'09:00');
      });
    });
    describe('merge(feature)',function(){
      it('merges the schedule from another feature', function () {
        section.merge(feature2);
        console.log(JSON.stringify(section));
        assert.equal(section.properties.schedules.West.startHour,'09:00');
      });
    });
    describe('getStreetSide(heading:number)',function() {
      section.merge(feature2);
      it('gets the street side, East or West, given heading 15', function () {
        console.log("heading:", 15, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(15), 'East');
      });
      it('gets the street side, East or West, given heading 0', function () {
        console.log("heading:", 0, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(0), 'East');
      });
      it('gets the street side, East or West, given heading 355', function () {
        console.log("heading:", 255, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(355), 'East');
      });
      it('gets the street side, East or West, given heading 89', function () {
        console.log("heading:", 89, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(89), 'East');
      });
      it('gets the street side, East or West, given heading 90', function () {
        console.log("heading:", 90, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(90), 'West');
      });
      it('gets the street side, East or West, given heading 95', function () {
        console.log("heading:", 95, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(95), 'West');
      });
      it('gets the street side, East or West, given heading 269', function () {
        console.log("heading:", 269, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(269), 'West');
      });
      it('gets the street side, East or West, given heading 271', function () {
        console.log("heading:", 271, "sides:", Object.keys(section.properties.schedules));
        assert.equal(section.getStreetSide(271), 'East');
      });
      describe('getStreetSide on section with NE or SW sides', function(){
        var feature = {
          geometry:{
            coordinates:[-124.44, 37.77]
          },
          properties:{
            week1ofmon:'Y', week2ofmon:'Y', week3ofmon:'Y', week4ofmon:'Y', week5ofmon:'Y', weekday: 'Mon',
            blockside: 'SouthWest', fromhour: '09:00', tohour: '12:00', streetname: 'Cayuga Ave', nhood: 'Excelsior',
            zip_code: 94112, cnnrightle: 'R', holidays: 'N', distance: 135, lf_fadd:1, lf_toadd:1, rt_fadd:1, rt_toadd:1
          }
        };
        var feature2 = {
          geometry:{
            coordinates:[-124.44, 37.77]
          },
          properties:{
            week1ofmon:'Y', week2ofmon:'Y', week3ofmon:'Y', week4ofmon:'Y', week5ofmon:'Y', weekday: 'Weds',
            blockside: 'NorthEast', fromhour: '09:00', tohour: '12:00', streetname: 'Cayuga Ave', nhood: 'Excelsior',
            zip_code: 94112, cnnrightle: 'L', holidays: 'N', distance: 135, lf_fadd:1, lf_toadd:1, rt_fadd:1, rt_toadd:1
          }
        };
        var section = new sfs.StreetSection(feature);
        section.merge(feature2);
        it('gets the street side, given heading 300', function () {
          console.log("heading:", 300, "sides:", Object.keys(section.properties.schedules));
          assert.equal(section.getStreetSide(300), 'NorthEast');
        });
        it('gets the street side, given heading 90', function () {
          console.log("heading:", 90, "sides:", Object.keys(section.properties.schedules));
          assert.equal(section.getStreetSide(90), 'SouthWest');
        });
      });
    });
  });
  describe('SweepScheduleFeatureGroup',function(){
    describe('constructor',function(){
      it('instantiates an empty group by default', function () {
        var group = new sfs.SweepScheduleFeatureGroup();
        console.log(JSON.stringify(group));
        assert.equal(group.features.length,0);
      });
      it('instantiates a new group with the given initial features', function () {
        var group = new sfs.SweepScheduleFeatureGroup([feature,feature2]);
        console.log(JSON.stringify(group));
        assert.equal(group.features.length,1);
        assert.equal(group.features[0].properties.schedules.West.startHour,'09:00');
      });
    });
    describe('merge',function() {
      it('instantiates a new group with the given initial features', function () {
        var group = new sfs.SweepScheduleFeatureGroup();
        group.merge(feature);
        assert.equal(group.features.length,1);
        group.merge(feature2);
        assert.equal(group.features.length,1);
        console.log(JSON.stringify(group));
      });
    });
  });
  
});

