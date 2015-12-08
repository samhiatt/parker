var Map = L.Map;
var LatLng = L.LatLng;
var Marker = L.Marker;
var map = L.map('map');
map.setView([37.77, -122.44], 15);
map.on('click', function (e) {
    var ll = e.latlng;
    console.log("click!", ll.lng, ll.lng);
    var streetSide;
    var heading = 15;
    if (heading <= 0 && heading < 90)
        streetSide = 'NorthWest';
    else if (heading < 90 && heading < 180)
        streetSide = 'SouthWest';
    else if (heading < 180 && heading < 270)
        streetSide = 'SouthEast';
    else if (heading < 270 && heading < 360)
        streetSide = 'NorthEast';
    d3.json('/query?lat=' + ll.lat + '&lon=' + ll.lng, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        var first = true;
        console.log("Got response:", err, data);
        data.features.forEach(function (feature) {
            if (first && streetSide.indexOf(feature.properties.blockside) > -1) {
                feature.properties.bestGuess = true;
                first = false;
            }
        });
        L.geoJson(data, {
            style: function (feature) {
                return {
                    color: (feature.properties.bestGuess) ? 'red' : 'blue'
                };
            },
            onEachFeature: function (feature, layer) {
                layer.on('click', function (event) {
                    console.log(feature, event);
                });
            }
        }).addTo(map);
    });
});
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
//# sourceMappingURL=index.js.map