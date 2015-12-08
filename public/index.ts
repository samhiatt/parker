import Map = L.Map;
import LatLng = L.LatLng;
import Feature = GeoJSON.Feature;
import ILayer = L.ILayer;
import Marker = L.Marker;
import PathOptions = L.PathOptions;
/**
 * Created by sam on 9/12/15.
 */

var map:Map = L.map('map');

map.setView([37.77,-122.44], 15);

map.on('click',function(e:any){
	var ll:LatLng = e.latlng;
	console.log("click!", ll.lng, ll.lng);
	var streetSide:string;
	var heading:number = 15;
	if (heading<=0 && heading<90) streetSide ='NorthWest';
	else if (heading<90 && heading<180) streetSide ='SouthWest';
	else if (heading<180 && heading<270) streetSide ='SouthEast';
	else if (heading<270 && heading<360) streetSide ='NorthEast';
	
	d3.json('/query?lat='+ll.lat+'&lon='+ll.lng, function(err,data){
		if (err) {
			console.error(err);
			return;
		}
		var first=true;
		console.log("Got response:",err,data);
		data.features.forEach(function(feature:Feature){
			if (first && streetSide.indexOf(feature.properties.blockside)>-1){
				feature.properties.bestGuess=true;
				first = false;
			}
		});
		L.geoJson(data, {
			style: function (feature:Feature):PathOptions {
				return {
					color: (feature.properties.bestGuess)? 'red' : 'blue'
					
				};
			},
			onEachFeature: function (feature:Feature, layer:any) {
				//layer.bindPopup(JSON.stringify(feature.properties));
				layer.on('click',function(event:any){
					console.log(feature,event)
				});
				//console.log(feature);
			}
		}).addTo(map);
	});
});

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
