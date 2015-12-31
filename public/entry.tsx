import React = require('react');
import ReactDOM = require('react-dom');
import L = require('leaflet');
import Props = __React.Props;
import Feature = GeoJSON.Feature;
import Marker = L.Marker;
import PathOptions = L.PathOptions;
import LatLng = L.LatLng;
import ILayer = L.ILayer;
import FeatureGroup = L.FeatureGroup;
import MultiLineString = GeoJSON.MultiLineString;
import LayerGroup = L.LayerGroup;
import {StreetSection, IStreetSectionProps} from "../common/sfsweeproutes";
import Component = __React.Component;

interface MapProps extends React.Props<any> {
	defaultZoom:number;
	defaultCenter: number[];
	onClickResult(data:any):void;
}

//interface InfoWindowProps extends React.Props<any>{
//	data:IStreetSectionProps|any;
//}

class Layout extends React.Component<Props<any>,any>{
	state:IStreetSectionProps;
	//getInitialState() {
	//	return {data: {}};
	//}
	props:any;
	context:any;
	refs:any;
	updateInfoWindow(streetSection:IStreetSectionProps){
		console.log("Layout updating infoWindow with streetSection", streetSection,this);
		console.log("Guessed street side", streetSection.guessedStreetSide,streetSection.schedules[streetSection.guessedStreetSide]);
		//this.setState(streetSection);
		//this.setState({streetSection:[streetSection]});
		//this.props=data;
		this.setState(streetSection);
	}
	forceUpdate(){
		// TODO
		console.log("TODO: Implement forceUpdate()");
	}
	//setState(state:{streetSection:IStreetSectionProps}){
	//	// TODO
	//	console.log("TODO: Implement Layout setState()",state);
	//	this.state = state;
	//}
	render(){
		//window.layout = this;
		return (
			<div id="contnet">
				<Map defaultZoom={15} defaultCenter={[37.77,-122.44]} onClickResult={this.updateInfoWindow.bind(this)}/>
				<InfoWindow data={this.state}/>
			</div>
		);
	}
}

class InfoWindow extends React.Component<any,IStreetSectionProps>{
	//constructor(props?:{data:any}){
	//	super(props);
	//	console.log("Constructing InfoWindow with props:",props);
	//	this.state=props.data;
	//}
	render(){
		console.log('InfoWindow rendering with this:',this);
		//var data = this.props.data? this.props.data[0] : {};
		var data = this.props.data;
		if (!data) return(<div>Click map to query street sweeping schedule.</div>);
		var side = data.schedules[data.guessedStreetSide];
		var daysOfWeek = side.daysOfWeek.join(', ');
		return (<div id="info">
			Street name: { data.streetName }<br />
			{ data.guessedStreetSide } side of street<br />
			{ side.startHour } to { side.endHour } <br />
			{ daysOfWeek } <br />
			{ side.holidays? 'holidays' : 'except holidays' } <br />
		</div>);
	}
}

class Map extends React.Component<MapProps,{}>{
	layers:LayerGroup<ILayer>;
	map:L.Map;
	//onClickResult(e:any){
	//	console.log("Got data:", e);
	//}
	componentDidMount() {
		console.log("did mount for Map, with props:",this.props);
		this.map = L.map('map');

		this.layers = L.featureGroup().addTo(this.map);

		this.map.setView(this.props.defaultCenter,this.props.defaultZoom);

		this.map.on('click',this.onClick.bind(this));

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(this.map);

	}
	onClick(e:any){
		var ll:LatLng = e.latlng;
		console.log("click!", ll.lng, ll.lng);
		
		this.map.setView(ll);

		d3.json('http://localhost:3000/query?lat='+ll.lat+'&lon='+ll.lng+'&heading=0', (err,data)=>{
			if (err) {
				console.error(err);
				return;
			}
			this.layers.clearLayers();

			var nearest:StreetSection;
			data.features.forEach((feature:StreetSection) => {
				//if (feature.properties.distanceFromPoint<100) feature.properties.bestGuess = true;console.log(feature.properties)
				if (!nearest || feature.properties.distanceFromPoint<nearest.properties.distanceFromPoint) nearest = feature;
			});
			nearest.properties.nearest = true;


			this.props.onClickResult(nearest.properties);

			this.layers.addLayer(L.geoJson(data, {
				style: (feature:Feature):PathOptions => {
					return {
						color: (feature.properties.nearest)? 'red' : 'blue'

					};
				},
				onEachFeature: (feature:Feature, layer:any)=> {
					//layer.bindPopup(JSON.stringify(feature.properties));
					//var self = this;
					layer.on('click',(event:any)=>{
						console.log(feature.properties,feature.properties.schedules);
						// set data 
					});
					//console.log(feature);
				}
			}));
		});
	}
	setState(state:any){
		// TODO
		console.log("TODO: Implement Map.setState()",state);
		this.state = state;
	}
	render(){
		console.log("center:",this.props.defaultCenter);
		return <div id="map"></div>;
	}
}



require("./style.css");


ReactDOM.render(
	<Layout/>,
	document.getElementById('layout')
);
