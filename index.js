/**
 * Created by sam on 9/12/15.
 */
var compress = require('compression');
var postgeo = require("postgeo");
var path = require("path");
var proj4 = require("proj4");
var express = require('express');
//require('dotenv').load();
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/node_modules/leaflet/dist/'));
app.use(express.static(__dirname + '/public/'));

app.use(compress());

app.get('/',function(req,res){

	res.render('index', {
		title: "SF Parker"
	});
});

app.get('/query', function (req, res) {
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
		", ST_AsGeoJson(ST_Transform(ST_ClosestPoint(ST_GeometryN(geom,1), ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227)),4326)) AS closest_point "+
		//", ST_AsText(ST_Intersection(ST_MakeLine(ST_MakePoint(ST_XMin(geom),"+point[1]+"),ST_MakePoint(ST_XMax(geom),"+point[0]+")),ST_GeometryN(geom,1)))"+
		"FROM sfsweeproutes WHERE ST_DWithin(geom,ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227),300)"+
		"ORDER BY distance LIMIT 12;";

	console.log(queryString);

	postgeo.query(queryString,
		"geojson", function(data) {
			if (data.features) {
				data.features = data.features.map(function(f){
					var pointOnStreet = JSON.parse(f.properties.closest_point).coordinates;
					var p1 = f.geometry.coordinates[0][0];
					f.properties.pointOnStreet = pointOnStreet;
					var vs = [pointOnStreet[0]-p1[0],pointOnStreet[1]-p1[1]];
					var vp = [req.query.lon-p1[0],req.query.lat-p1[1]];
					f.properties.side = (vs[0]*vp[1]-vs[1]*vp[0])<0? "R" : "L";
					return f;
				});
			}
			console.log(data.features||data);
			res.header('content-type', 'text/javascript');
			res.send(JSON.stringify(data));
		});
});

var dbUri = process.env.PG_DB_URI || "postgress://localhost/parker";
postgeo.connect(dbUri);
console.log("Connected to "+dbUri.replace(/(\/\/).*@/,'$1'));

var server = app.listen(80, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Server listening at http://%s:%s', host, port);
});

proj4.defs([
	[
		'EPSG:2227',
		'+proj=lcc +lat_1=38.43333333333333 +lat_2=37.06666666666667 +lat_0=36.5 +lon_0=-120.5 +x_0=2000000.0001016 +y_0=500000.0001016001 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'
	]
]);

var transform = proj4('EPSG:2227');
