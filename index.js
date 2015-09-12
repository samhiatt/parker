/**
 * Created by sam on 9/12/15.
 */
var postgeo = require("postgeo");
var proj4 = require("proj4");
var express = require('express');
var app = express();

app.get('/', function (req, res) {
	if (!req.query.lat || !req.query.lon) {
		res.status(400).send("Expected 'lat' and 'lon' query params.");
		return;
	}
	
	var point = transform.forward([parseFloat(req.query.lon),parseFloat(req.query.lat)]);
	//var point = transform.forward([-122.444,37.72]);
	console.log("Request for point: ",point);
	
	var queryString = "SELECT gid, weekday, blockside, cnnrightle, fromhour, tohour, streetname"+
		", ST_AsGeoJson(ST_Transform(geom,4326)) AS geometry"+
		", ST_Distance(geom,ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227)) AS distance "+
		", ST_AsText(ST_ClosestPoint(ST_GeometryN(geom,1), ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227))) AS closest_point "+
		"FROM sfsweeproutes WHERE ST_DWithin(geom,ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227),300)"+
		"ORDER BY distance LIMIT 6;";

	console.log(queryString);

	postgeo.query(queryString,
		"geojson", function(data) {
			//console.log(JSON.stringify(data));
			console.log(data.features||data);
			res.send(JSON.stringify(data));
		});
});

postgeo.connect("postgres://localhost/sam");

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

proj4.defs([
	[
		'EPSG:2227',
		'+proj=lcc +lat_1=38.43333333333333 +lat_2=37.06666666666667 +lat_0=36.5 +lon_0=-120.5 +x_0=2000000.0001016 +y_0=500000.0001016001 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'
	]
]);

var transform = proj4('EPSG:2227');
