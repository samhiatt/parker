/**
 * Created by sam on 9/12/15.
 */
var postgeo = require("postgeo");
var proj4 = require("proj4");

proj4.defs([
	[
		'EPSG:2227',
		'+proj=lcc +lat_1=38.43333333333333 +lat_2=37.06666666666667 +lat_0=36.5 +lon_0=-120.5 +x_0=2000000.0001016 +y_0=500000.0001016001 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'
	]
]);

var transform = proj4('EPSG:2227');

var point = transform.forward([-122.444,37.72]);

postgeo.connect("postgres://localhost/sam");

var queryString = "SELECT gid, weekday, blockside, cnnrightle, fromhour, tohour, streetname"+
	", ST_AsGeoJSON(geom) AS geometry, ST_Distance(geom,ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227)) AS distance "+
	", ST_AsText(ST_ClosestPoint(ST_GeometryN(geom,1), ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227))) AS closest_point "+
	"FROM sfsweeproutes WHERE ST_DWithin(geom,ST_GeomFromText('POINT("+point[0]+" "+point[1]+")',2227),300)"+
	"ORDER BY distance LIMIT 6;";

console.log(queryString);

postgeo.query(queryString, 
	"geojson", function(data) {
	console.log(JSON.stringify(data));
	console.log(data.features||data)
});