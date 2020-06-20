var mymap,centerCoords,geoQuery,greenIcon,redIcon,goldIcon,orangeIcon,selectedIssue,mapObjects={"Rezolvată":{color:"green"},"Cu răspuns":{color:"#b57016"},"Cu număr de înregistrare":{color:"#fcf260"},"Fără răspuns":{color:"#b51616"}};function initMap(){mymap=L.map("mapid"),L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",{maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(mymap);var e=L.control({position:"topright"});e.onAdd=function(e){var t=L.DomUtil.create("div","info legend");for(var a in log("Shwo legend "+mapObjects),mapObjects){log("show legend for "+a);var o=mapObjects[a];t.innerHTML+='<i style="background:'+o.color+"; opacity:"+o.opacity+';">&nbsp;&nbsp;&nbsp;&nbsp;</i> '+a+"<br>"}return t},e.addTo(mymap),greenIcon=new L.Icon({iconUrl:"https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]}),redIcon=new L.Icon({iconUrl:"https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]}),goldIcon=new L.Icon({iconUrl:"https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]}),orangeIcon=new L.Icon({iconUrl:"https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]})}function getCenterPoint(){centerCoords=[45.9852129,24.6859225]}function handleData(e){var t=e.extraParams;if(log("Extra params: "+JSON.stringify(t)),null!=t){var a=t.centerPoint;null!=a?(log("Set center point: "+JSON.stringify(a)),mymap.setView([a.lat,a.lon],12)):mymap.setView([45.9852129,24.6859225],7)}log("Handling "+e.data.notifications.length+" notifications."),e.data.notifications.forEach(function(e){displayNotification(e)})}function formatTextToHtml(e){return e.replace(/(?:\r\n|\r|\n)/g,"<br/>")}function getMarkerClickFunction(e){return function(t){var a=$("<div>");a.append($("<b>Către "+e.targetInstitutionName+"</b>"));var o=$("<div>");a.append(o);var r=$("<ul>");o.append(r),r.append($("<li><a href='#detalii'>Detalii</a></li>"));var n=formatTextToHtml(e.content),i=e.creatorData,l=$("<div class='issueDetailsContent'>");if(o.append($("<div id='detalii'>").append(l)),null!=i.registrationNumber&&(n+="<br/>Număr de înregistrare: "+i.registrationNumber),null!=i.response){var s=formatTextToHtml(i.response);r.append($("<li><a href='#raspuns'>Răspuns</a></li>"));var c=$("<div class='issueDetailsContent'>");c.html(s),o.append($("<div id='raspuns'>").append(c))}if(i.resolutionComment){var p=formatTextToHtml(i.resolutionComment);r.append($("<li><a href='#observatii'>Observații</a></li>"));var d=$("<div class='issueDetailsContent'>");d.html(p),o.append($("<div id='observatii'>").append(d))}return a.tabs(),l.html(n),a[0]}}function displayNotification(e){if(null!=e.creatorData.specificData){var t=e.creatorData.specificData["~gpsLocation"];if(null!=t.lat&&null!=t.lon)try{var a=e.creatorData,o=redIcon;a.resolved?o=greenIcon:a.responseReceivedTimestamp>0?o=orangeIcon:a.registrationReceivedTimestamp>0&&(o=goldIcon);var r=Math.min(300,.65*$(window).width());L.marker([t.lat,t.lon],{icon:o}).addTo(mymap).bindPopup(getMarkerClickFunction(e),{maxWidth:r})}catch(t){log("Failed to display notif "+t+JSON.stringify(e))}}else log("no data for "+e.targetEntityId)}function pageRefresh(e){null!=mymap&&mymap.remove(),initMap(),geoQuery=null;var t=getFiltersValues();if(null!=t){var a=PB.filtersListToObject(t);log("using filtersController "+filtersController);var o=filtersController.getDataForFieldValue("~county",a["~county"]),r=filtersController.getDataForFieldValue("~uat",a["~uat"]);log("countyData="+o),log("areaData="+r),null!=r&&null!=o&&(log("refresh with county: "+JSON.stringify(o)+" ,uat: "+JSON.stringify(r)),geoQuery=r.desc+", "+o.desc)}log("refresh "+currentSectionData.id+"with filters: "+e),PB.pbAgent.refreshSection({sectionId:currentSectionData.id,startItem:0,itemCount:500,filtersList:e,extraParams:{geoQuery:geoQuery}})}JSUTIL.injectLinkToHead("https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"),JSUTIL.injectScriptToHead("https://unpkg.com/leaflet@1.5.1/dist/leaflet.js",pageRefresh);var self=this;PB.sectionController={refreshSection:function(e){pageRefresh(e)},onSectionData:function(e){handleData(e)}};