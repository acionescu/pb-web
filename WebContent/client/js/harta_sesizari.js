  var mymap;

    var centerCoords;
    var geoQuery;

    var greenIcon, redIcon, goldIcon, orangeIcon;

    var selectedIssue;
    
    var mapObjects={
	    "Rezolvată":{
		color: 'green'
	    },
	    "Cu răspuns":{
		color: '#b57016'
	    },
	    "Cu număr de înregistrare":{
		color: '#fcf260'
	    },
	    "Fără răspuns":{
		color: '#b51616'
	    }
    };

    function initMap() {

	mymap = L.map('mapid');
	
	L
		.tileLayer(
			'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
			{
			    maxZoom : 18,
			    attribution : 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, '
				    + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
				    + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			    id : 'mapbox.streets'
			}).addTo(mymap);
	
	/* add legend */
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
	

	greenIcon = new L.Icon(
		{
		    iconUrl : 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
		    shadowUrl : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		    iconSize : [ 25, 41 ],
		    iconAnchor : [ 12, 41 ],
		    popupAnchor : [ 1, -34 ],
		    shadowSize : [ 41, 41 ]
		});
	redIcon = new L.Icon(
		{
		    iconUrl : 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
		    shadowUrl : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		    iconSize : [ 25, 41 ],
		    iconAnchor : [ 12, 41 ],
		    popupAnchor : [ 1, -34 ],
		    shadowSize : [ 41, 41 ]
		});

	goldIcon = new L.Icon(
		{
		    iconUrl : 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
		    shadowUrl : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		    iconSize : [ 25, 41 ],
		    iconAnchor : [ 12, 41 ],
		    popupAnchor : [ 1, -34 ],
		    shadowSize : [ 41, 41 ]
		});

	orangeIcon = new L.Icon(
		{
		    iconUrl : 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
		    shadowUrl : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		    iconSize : [ 25, 41 ],
		    iconAnchor : [ 12, 41 ],
		    popupAnchor : [ 1, -34 ],
		    shadowSize : [ 41, 41 ]
		});
    }

    JSUTIL.injectLinkToHead("https://unpkg.com/leaflet@1.5.1/dist/leaflet.css");
    JSUTIL.injectScriptToHead(
	    "https://unpkg.com/leaflet@1.5.1/dist/leaflet.js", pageRefresh);

    function getCenterPoint() {
	/* set default center coords */
	centerCoords = [ 45.9852129, 24.6859225 ];

	// 	var queryString = "România";
	// 	$.getJSON('http://nominatim.openstreetmap.org/search?format=geojson&limit=1&countrycodes=ro&q=' + queryString, function(data) {
	// 	    log("got geojson data "+JSON.stringify(data));
	// 	    if(data != null){
	// 		var coords = data.features[0].geometry.coordinates;
	// 		log("coords = "+coords);
	// 	    }
	// 	});
    }

    function handleData(data) {
	var extraParams = data.extraParams;
	log("Extra params: " + JSON.stringify(extraParams));
	if (extraParams != null) {
	    var centerPoint = extraParams.centerPoint;
	    if (centerPoint != null) {
		log("Set center point: " + JSON.stringify(centerPoint));
		mymap.setView([ centerPoint.lat, centerPoint.lon ], 12);
	    }
	    else{
		mymap.setView([ 45.9852129, 24.6859225 ], 7);
	    }
	}

	log("Handling " + data.data.notifications.length + " notifications.");
	data.data.notifications.forEach(function(n) {
	    displayNotification(n);
	});
    }
    
    function formatTextToHtml(text){
	return text.replace(/(?:\r\n|\r|\n)/g, "<br/>");
    }

    function getMarkerClickFunction(n) {
	return function(l) {
	    var c = $("<div>");
	    c.append($("<b>Către " + n.targetInstitutionName + "</b>"));
	    
	    var cBody = $("<div>");
	    
	    c.append(cBody);
	    
	    var cTabsHeader = $("<ul>");
	    cBody.append(cTabsHeader);

	    cTabsHeader.append($("<li><a href='#detalii'>Detalii</a></li>"));
	    var content = formatTextToHtml(n.content);

	    var creatorData = n.creatorData;
	    var contentCont =  $("<div class='issueDetailsContent'>");

	    cBody.append($("<div id='detalii'>").append(contentCont));
	    
// 	    var footerControls = $("<div class='issueDetailsFooter'>");

// 	    var extraContent = $("<div class='issueDetailsFooter'>");
// 	    extraContent.hide();

	    if (creatorData.registrationNumber != null) {
		content += "<br/>Număr de înregistrare: "
			+ creatorData.registrationNumber;
	    }

	    if (creatorData.response != null) {
// 		var rb = $("<button>").html("Vezi răspuns");
// 		rb.click(function() {

// 		    if (extraContent.is(":visible")) {
// 			extraContent.hide();
// 			rb.html("Vezi răspuns");
// 			contentCont.show();
// 		    } else {
// 			var res = formatTextToHtml(creatorData.response);
// 			extraContent.html(res);
// 			extraContent.show();
// 			rb.html("Ascunde răspuns");
// 			contentCont.hide();
// 		    }
// 		});
// 		footerControls.append(rb);

		var res = formatTextToHtml(creatorData.response);
		cTabsHeader.append($("<li><a href='#raspuns'>Răspuns</a></li>"));
	 	var respContent = $("<div class='issueDetailsContent'>");
	 	respContent.html(res);
	 	cBody.append($("<div id='raspuns'>").append(respContent));
	    }
	    
	    if(creatorData.resolutionComment){
		var comm = formatTextToHtml(creatorData.resolutionComment);
		cTabsHeader.append($("<li><a href='#observatii'>Observații</a></li>"));
	 	var commContent = $("<div class='issueDetailsContent'>");
	 	commContent.html(comm);
	 	cBody.append($("<div id='observatii'>").append(commContent));
	    }
	    
	    c.tabs();
	    
	    contentCont.html(content);
	    
// 	    c.append(contentCont);
// 	    c.append(extraContent);
// 	    c.append(footerControls);

	    return c[0];
	}
    }

    function displayNotification(n) {

	if (n.creatorData.specificData == null) {
	    log("no data for " + n.targetEntityId);
	    return;
	}

	var gpsPos = n.creatorData.specificData["~gpsLocation"];

	if (gpsPos.lat != null && gpsPos.lon != null) {
	    try {
		var creatorData = n.creatorData;

		var markerIcon = redIcon;
		if (creatorData.resolved) {
		    markerIcon = greenIcon;
		} else if (creatorData.responseReceivedTimestamp > 0) {
		    markerIcon = orangeIcon;
		} else if (creatorData.registrationReceivedTimestamp > 0) {
		    markerIcon = goldIcon;
		}

		var maxPopupWidth = Math.min(300, $(window).width() * 0.65);

		// 		L .marker([ gpsPos.lat, gpsPos.lon ], {icon: markerIcon}).addTo(mymap).bindPopup(
		// 			"<b>Către "+n.targetInstitutionName+"</b><br /><div class='issueDetailsContent'>"+content+"</div>"+footerControls[0],{"maxWidth": maxPopupWidth});

		L.marker([ gpsPos.lat, gpsPos.lon ], {
		    icon : markerIcon
		}).addTo(mymap).bindPopup(getMarkerClickFunction(n), {
		    "maxWidth" : maxPopupWidth
		});
	    } catch (e) {
		log("Failed to display notif " + e + JSON.stringify(n));
	    }
	}
    }

    function pageRefresh(filtersValues) {
	if (mymap != null) {
// 	    mymap.off();
	    mymap.remove();
	}
	
	initMap();
	
	geoQuery = null;

	var filterValues = getFiltersValues();
	if (filterValues != null) {
	    var currentFilters = PB.filtersListToObject(filterValues);
	    /* get selected areas data */
	    log("using filtersController " + filtersController);
	    var countyData = filtersController.getDataForFieldValue("~county",
		    currentFilters["~county"]);
	    var areaData = filtersController.getDataForFieldValue("~uat",
		    currentFilters["~uat"]);
	    log("countyData=" + countyData);
	    log("areaData=" + areaData);

	    if (areaData != null && countyData != null) {
		log("refresh with county: " + JSON.stringify(countyData)
			+ " ,uat: " + JSON.stringify(areaData));

		geoQuery = areaData.desc + ", " + countyData.desc;

	    }
	}
	
	log("refresh " + currentSectionData.id + "with filters: "
		+ filtersValues);
	PB.pbAgent.refreshSection({
	    sectionId : currentSectionData.id,
	    startItem : 0,
	    itemCount : 500,
	    filtersList : filtersValues,
	    extraParams : {
		"geoQuery" : geoQuery
	    }
	});
    }

    var self = this;
    /* section controller */

    PB.sectionController = {

	refreshSection : function(filtersValues) {
	    pageRefresh(filtersValues);
	},

	onSectionData : function(data) {
	    handleData(data);
	}
    };

    //     PB.refreshCurrentSection(null);
