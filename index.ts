/**
 * Created by sam on 9/12/15.
 */
import 'lodash';
import {Request, Response} from "express";
import FeatureCollection = GeoJSON.FeatureCollection;
import Feature = GeoJSON.Feature;
var sfs = require('./common/sfsweeproutes');
var compress = require('compression');
var postgeo = require("postgeo");
var path = require("path");
var proj4 = require("proj4");
var express = require('express');
var _ = require('lodash');
//require('dotenv').load();
var app = express();

//var dbUri="postgress://"+process.env.RDS_USERNAME+":"+
//	process.env.RDS_PASSWORD+"@"+process.env.RDS_HOSTNAME+
//	":"+process.env.RDS_PORT+"/"+process.env.RDS_DB_NAME;

//var dbUri = process.env.PG_DB_URI || "postgress://localhost/parker";
var dbUri = "postgress://localhost/parker";
postgeo.connect(dbUri);
console.log("Connected to "+dbUri.replace(/(\/\/).*@/,'$1'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/node_modules/leaflet/dist/'));
app.use(express.static(__dirname + '/public/'));

app.use(compress());

app.get('/',function(req:Request,res:Response){

	res.render('index', {
		title: "SF Parker"
	});
});

// Sample query: http://localhost:3000/query?lat=37.78334413776629&lon=-122.39836831201166
app.get('/query', function (req:Request,res:Response) {
	if (!req.query.lat || !req.query.lon) {
		res.status(400).send("Expected 'lat' and 'lon' query params.");
		return;
	}
	
	var point = transform.forward([parseFloat(req.query.lon),parseFloat(req.query.lat)]);
	//var point = transform.forward([-122.444,37.72]);
	console.log("Request for point: ",point);
	
	var queryString = "SELECT weekday, week1ofmon, week2ofmon, week3ofmon, week4ofmon, week5ofmon, blockside, "+
		" lf_fadd, lf_toadd, rt_toadd, rt_fadd, holidays, nhood, zip_code " +
		" cnnrightle, fromhour, tohour, streetname, ST_AsGeoJson(ST_Transform(geom,4326)) AS geometry"+
		", ST_Distance(geom,ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227)) AS distance "+
		", ST_AsGeoJson(ST_Transform(ST_ClosestPoint("+
				"ST_GeometryN(geom,1), ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227)"+ 
		"),4326)) AS nearest_point "+
		"FROM sfsweeproutes WHERE ST_DWithin(geom,ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227),300)"+
		"ORDER BY distance LIMIT 24;";

	console.log(queryString);

	postgeo.query(queryString,"geojson", function(data:FeatureCollection) {
		if (data.features) {
			console.log("Retrieved " + data.features.length + " features.");
			
			data.features = sfs.combineAndTransformFeatures(data.features);
			
			//data.features = data.features.map(function(feature:Feature){
			//	var props = feature.properties;
			//	props.weeks=[];
			//	[1,2,3,4,5].forEach(function(week){
			//		if(props['week'+week+'ofmon']) props.weeks.push(week);
			//	});
			//	props.nearest_point = JSON.parse(props.nearest_point);
			//	var pointOnStreet = props.nearest_point.coordinates;
			//	var p1 = feature.geometry.coordinates[0][0];
			//	var vs = [pointOnStreet[0]-p1[0],pointOnStreet[1]-p1[1]];
			//	var vp = [req.query.lon-p1[0],req.query.lat-p1[1]];
			//	props.side = (vs[0]*vp[1]-vs[1]*vp[0])<0? "R" : "L";
			//	props.schedule = new Schedule(props.fromhour,props.tohour,props.weekday.split(','),props.weeks);
			//	props.nextCleaning = props.schedule.next();
			//	return feature;
			//});
		}
		//console.log(data.features||data);
		res.header('content-type', 'text/javascript');
		res.send(JSON.stringify(data));
	});
});

var server = app.listen(process.env.PORT || 3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Server listening at http://%s:%s', host, port);
});

proj4.defs([
	[
		'EPSG:2227',
		'+proj=lcc +lat_1=38.43333333333333 +lat_2=37.06666666666667 +lat_0=36.5 +lon_0=-120.5 '+
		'+x_0=2000000.0001016 +y_0=500000.0001016001 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'
	]
]);

var transform = proj4('EPSG:2227');
