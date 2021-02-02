  console.log("load traffic page");

    var mymap;
    
    var mapObjects={
	    "Zonă de plecare":{
		color: '#30f',
		opacity:0.2
	    },
	    "Zonă de sosire":{
		color:'#f03',
		opacity:0.2
	    },
	    "Trafic redus":{
		color: 'green'
	    },
	    "Trafic ridicat":{
		color: 'orange'
	    },
	    "Trafic intens":{
		color: 'red'
	    }
    };

    function initMap() {
	
	 
	 var currentFilters = PB.filtersListToObject(getFiltersValues());
	 
	var osmData = filtersController.getDataForFieldValue("osmId",currentFilters["osmId"]); 
	log("init map with osmData "+JSON.stringify(osmData)); 
	
	var centerCoords= [ 44.4361414, 26.1027202 ];
	
	if(osmData != null){
	    var cpData = osmData.value.center_point;
	    if(cpData != null && cpData.coordinates){
	    	centerCoords = [cpData.coordinates[1],cpData.coordinates[0]];
	    }
	}
	 
	mymap = L.map('mapid').setView(centerCoords, 11);

	L.tileLayer(
		'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
		{
		    maxZoom : 18,
		    attribution : 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, '
			    + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
			    + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			    id: 'mapbox/streets-v11',
			    accessToken:'pk.eyJ1IjoiYWNpb25lc2N1IiwiYSI6ImNra250andmZDExYzYycXJxMzUxemprZ3YifQ.XJLJEliq4OfjACW9degzFg'
		}).addTo(mymap);

	PB.MODULES.GEO.getTrafficDensity(currentFilters);

	// 	L.marker([ 51.5, -0.09 ]).addTo(mymap).bindPopup(
	// 		"<b>Hello world!</b><br />I am a popup.").openPopup();

	// 	L.circle([ 51.508, -0.11 ], 500, {
	// 	    color : 'red',
	// 	    fillColor : '#f03',
	// 	    fillOpacity : 0.5
	// 	}).addTo(mymap).bindPopup("I am a circle.");

	// 	L.polygon([ [ 51.509, -0.08 ], [ 51.503, -0.06 ], [ 51.51, -0.047 ] ])
	// 		.addTo(mymap).bindPopup("I am a polygon.");

	// 	var popup = L.popup();
	
	
	var legend = L.control({position: 'topright'});

	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend');
	    

	    // loop through our density intervals and generate a label with a colored square for each interval
	    log("Shwo legend "+mapObjects);
	    for (var moid in mapObjects) {
		log("show legend for "+moid);
		var mo = mapObjects[moid];
	        div.innerHTML +='<i style="background:'+mo.color+'; opacity:'+mo.opacity+';">'+'&nbsp;&nbsp;&nbsp;&nbsp;'+'</i> '+moid+'<br>';
	}

	return div;
	};

	legend.addTo(mymap);
    }
    

    function handleTrafficDensityData(ec) {
	console.log("handle traffic data in page");
	var ztf = ec.event.data.zonesTrafficDensity;
	for ( var zi in ztf) {
	    displayTrafficDensity(ztf[zi]);
	}
    }
    
    function encodeDensityToColor(density){
	if(density < 2){
	    return 'green';
	}
	else if (density < 4){
	    return 'orange';
	}
	return 'red';
    }
    
    function metersToPixels(map,dm){
	var metersPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
	return dm/metersPerPixel;
    }

    function displayTrafficDensity(tfData) {
	var depZone = tfData.departureZone;
	var arrZone = tfData.arrivalZone;
	var density = tfData.density;

	var depCp = depZone.center.coordinates;
	var arrCp = arrZone.center.coordinates;
	
	var pointA = new L.LatLng(depCp[1], depCp[0]);
	var pointB = new L.LatLng(arrCp[1], arrCp[0]);
	
	/* get projections */
	var pointAProj =mymap.latLngToLayerPoint(pointA);
	var pointBProj =mymap.latLngToLayerPoint(pointB);
	
	
// 	    var line = JSUTIL.toSlopeLine(0,0,pointBProj.x, pointBProj.y);
	    
// 	    /* get points of intersection with circle 1 */
// 	    var ip1 = JSUTIL.findCircleLineIntersections(depZone.radius, 0,0,line.m,line.b);
	
// 	var originPoint = L.point(ip1[0].x, ip1[0].y).add(pointAProj);
	
// // 	var testSp= JSUTIL.getShortestSegmentBetweenCircles(depZone.radius, pointAProj.x,pointAProj.y, arrZone.radius, 0, 0);
	
// 	var pointAUp = mymap.layerPointToLatLng(originPoint);
// 	L.marker([pointAUp.lat, pointAUp.lng ]).addTo(mymap);
	
	/* get shortest segment between departure and arrival zones */
	var sp = JSUTIL.getShortestSegmentBetweenCircles(metersToPixels(mymap,depZone.radius), pointAProj.x,pointAProj.y, metersToPixels(mymap,arrZone.radius), pointBProj.x, pointBProj.y);

	pointA = mymap.layerPointToLatLng(L.point(sp.p1.x, sp.p1.y));
	pointB = mymap.layerPointToLatLng(L.point(sp.p2.x, sp.p2.y));

	// 	var pointA = new L.LatLng(45.7538354955963, 21.2257474);
	var pointList = [ pointA, pointB ];
	
	var flowColor=encodeDensityToColor(density);

	var flowLine = new L.Polyline(pointList, {
	    color : flowColor,
	    weight : metersToPixels(mymap,density*100),
	    opacity : 0.5,
	    smoothFactor : 1
	});
	flowLine.addTo(mymap);

	var decorator = L.polylineDecorator(flowLine, {
	    patterns : [
	    // defines a pattern of 10px-wide dashes, repeated every 20px on the line
	    {
		offset : '50%',
		repeat : 0,
		symbol : L.Symbol.arrowHead({
		    
		    pixelSize : 10,
		    polygon : false,
		    pathOptions : {
			color:flowColor,
			stroke : true,
		    }
		})
	    } ]
	}).addTo(mymap);

	/* dep zone */
	L.circle([ depCp[1], depCp[0] ], depZone.radius, {
	    color : 'none',
	    fillColor : '#30f',
	    fillOpacity : 0.2
	}).addTo(mymap);
	
	L.circle([ arrCp[1], arrCp[0] ], arrZone.radius, {
	    color : 'none',
	    fillColor : '#f03',
	    fillOpacity : 0.2
	}).addTo(mymap);
    }

    JSUTIL.injectLinkToHead("https://unpkg.com/leaflet@1.5.1/dist/leaflet.css");
    JSUTIL.injectScriptToHead(
	    "https://unpkg.com/leaflet@1.5.1/dist/leaflet.js", function() {
		JSUTIL.injectScriptToHead("./tp/leaflet.polylineDecorator.js",
			initMap);
	    });
    
var self=this;    
/* section controller */

PB.sectionController={

	refreshSection:function(filtersValues){
	   	mymap.remove();
		self.initMap();
	}
};

