/**
 * Created by sam on 9/12/15.
 */
	
var map = L.map('map').setView([37.77,-122.44], 13);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);