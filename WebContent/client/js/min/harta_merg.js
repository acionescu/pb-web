var mymap;console.log("load traffic page");var mapObjects={"Zonă de plecare":{color:"#30f",opacity:.2},"Zonă de sosire":{color:"#f03",opacity:.2},"Trafic redus":{color:"green"},"Trafic ridicat":{color:"orange"},"Trafic intens":{color:"red"}};function initMap(){var e=PB.filtersListToObject(getFiltersValues()),o=filtersController.getDataForFieldValue("osmId",e.osmId);log("init map with osmData "+JSON.stringify(o));var t=[44.4361414,26.1027202];if(null!=o){var a=o.center_point;null!=a&&a.coordinates&&(t=[a.coordinates[1],a.coordinates[0]])}mymap=L.map("mapid").setView(t,11),L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",{maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(mymap),PB.MODULES.GEO.getTrafficDensity(e);var i=L.control({position:"topright"});i.onAdd=function(e){var o=L.DomUtil.create("div","info legend");for(var t in log("Shwo legend "+mapObjects),mapObjects){log("show legend for "+t);var a=mapObjects[t];o.innerHTML+='<i style="background:'+a.color+"; opacity:"+a.opacity+';">&nbsp;&nbsp;&nbsp;&nbsp;</i> '+t+"<br>"}return o},i.addTo(mymap)}function handleTrafficDensityData(e){console.log("handle traffic data in page");var o=e.event.data.zonesTrafficDensity;for(var t in o)displayTrafficDensity(o[t])}function encodeDensityToColor(e){return e<2?"green":e<4?"orange":"red"}function metersToPixels(e,o){return o/(40075016.686*Math.abs(Math.cos(e.getCenter().lat*Math.PI/180))/Math.pow(2,e.getZoom()+8))}function displayTrafficDensity(e){var o=e.departureZone,t=e.arrivalZone,a=e.density,i=o.center.coordinates,r=t.center.coordinates,n=new L.LatLng(i[1],i[0]),l=new L.LatLng(r[1],r[0]),s=mymap.latLngToLayerPoint(n),c=mymap.latLngToLayerPoint(l),p=JSUTIL.getShortestSegmentBetweenCircles(metersToPixels(mymap,o.radius),s.x,s.y,metersToPixels(mymap,t.radius),c.x,c.y),m=[n=mymap.layerPointToLatLng(L.point(p.p1.x,p.p1.y)),l=mymap.layerPointToLatLng(L.point(p.p2.x,p.p2.y))],d=encodeDensityToColor(a),y=new L.Polyline(m,{color:d,weight:metersToPixels(mymap,100*a),opacity:.5,smoothFactor:1});y.addTo(mymap);L.polylineDecorator(y,{patterns:[{offset:"50%",repeat:0,symbol:L.Symbol.arrowHead({pixelSize:10,polygon:!1,pathOptions:{color:d,stroke:!0}})}]}).addTo(mymap);L.circle([i[1],i[0]],o.radius,{color:"none",fillColor:"#30f",fillOpacity:.2}).addTo(mymap),L.circle([r[1],r[0]],t.radius,{color:"none",fillColor:"#f03",fillOpacity:.2}).addTo(mymap)}JSUTIL.injectLinkToHead("https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"),JSUTIL.injectScriptToHead("https://unpkg.com/leaflet@1.5.1/dist/leaflet.js",function(){JSUTIL.injectScriptToHead("./tp/leaflet.polylineDecorator.js",initMap)});var self=this;PB.sectionController={refreshSection:function(e){mymap.remove(),self.initMap()}};