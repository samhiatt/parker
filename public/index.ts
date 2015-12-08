import Map = L.Map;
import LatLng = L.LatLng;
import Feature = GeoJSON.Feature;
import Marker = L.Marker;
import PathOptions = L.PathOptions;
import {StreetSection} from "../common/sfsweeproutes";
/**
 * Created by sam on 9/12/15.
 */

var map:Map = L.map('map');

var layers = L.featureGroup().addTo(map);

map.setView([37.77,-122.44], 15);

map.on('click',function(e:any){
	var ll:LatLng = e.latlng;
	console.log("click!", ll.lng, ll.lng);
	var streetSide:string;
	var heading:number = 280;
	heading+=90; // 90 degree offset to point towards curb
	if (heading>=360) heading=0;
	if (heading<=337.5 && heading<22.5) streetSide ='NorthWest';
	else if (heading<22.5 && heading<67.5) streetSide ='North';
	else if (heading<67.5 && heading<112.5) streetSide ='West';
	else if (heading<112.5 && heading<157.5) streetSide ='SouthWest';
	else if (heading<157.5 && heading<202.5) streetSide ='South';
	else if (heading<202.5 && heading<247.5) streetSide ='SouthEast';
	else if (heading<247.5 && heading<292.5) streetSide ='East';
	else if (heading<292.5 && heading<337.5) streetSide ='NorthEast';
	
	d3.json('/query?lat='+ll.lat+'&lon='+ll.lng, function(err,data){
		if (err) {
			console.error(err);
			return;
		}
		layers.clearLayers();

		var nearest:StreetSection;
		data.features.forEach((feature:StreetSection) => {
			//if (feature.properties.distanceFromPoint<100) feature.properties.bestGuess = true;console.log(feature.properties)
			if (!nearest || feature.properties.distanceFromPoint<nearest.properties.distanceFromPoint) nearest = feature;
		});
		if (nearest){
			for (var side in nearest.properties.schedules){
				if (nearest.properties.schedules.hasOwnProperty(side)){
					if ( side == streetSide
						|| side.indexOf(streetSide)>-1
						|| streetSide.indexOf(side)>-1
					) nearest.properties.bestGuess=side;
				}
			}
		} 

		layers.addLayer(L.geoJson(data, {
			style: function (feature:Feature):PathOptions {
				return {
					color: (feature.properties.bestGuess)? 'red' : 'blue'
					
				};
			},
			onEachFeature: function (feature:Feature, layer:any) {
				//layer.bindPopup(JSON.stringify(feature.properties));
				//var self = this;
				layer.on('click',function(event:any){
					console.log(feature.properties,feature.properties.schedules);
				});
				//console.log(feature);
			}
		}));
	});
});

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
