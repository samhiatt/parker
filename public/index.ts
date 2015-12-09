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
		nearest.properties.nearest = true;

		layers.addLayer(L.geoJson(data, {
			style: function (feature:Feature):PathOptions {
				return {
					color: (feature.properties.nearest)? 'red' : 'blue'
					
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
