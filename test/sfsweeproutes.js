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
    week1ofmon:'Y',
    week2ofmon:'Y',
    week3ofmon:'Y',
    week4ofmon:'Y',
    week5ofmon:'Y',
    weekday: 'Mon',
    blockside: 'West',
    fromhour: '09:00',
    tohour: '12:00',
    streetname: 'Cayuga Ave',
    nhood: 'Excelsior',
    zip_code: 94112,
    cnnrightle: 'R',
    holidays: 'N',
    distance: 135,
    lf_fadd:1,
    lf_toadd:1,
    rt_fadd:1,
    rt_toadd:1
  }
};
var feature2 = {
  geometry:{
    coordinates:[-124.44, 37.77]
  },
  properties:{
    week1ofmon:'Y',
    week2ofmon:'Y',
    week3ofmon:'Y',
    week4ofmon:'Y',
    week5ofmon:'Y',
    weekday: 'Weds',
    blockside: 'West',
    fromhour: '09:00',
    tohour: '12:00',
    streetname: 'Cayuga Ave',
    nhood: 'Excelsior',
    zip_code: 94112,
    cnnrightle: 'L',
    holidays: 'N',
    distance: 135,
    lf_fadd:1,
    lf_toadd:1,
    rt_fadd:1,
    rt_toadd:1
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

