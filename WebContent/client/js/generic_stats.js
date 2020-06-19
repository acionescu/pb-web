log("loaded generic_stats.js");  
var eTypesMap = {
	"REQUEST_TEMPLATE" : "Solicitări",
	"PETITION" : "Petiții"
    }

    var statsConfig = {
	"templates" : {
	    label : "Formulare adăugate",
	    desc : "Număr de formulare adăugate pe platforma Panoul de Bord"
	},
	"users" : {
	    label : "Total interacțiuni",
	    desc : "Număr total de trimiteri plus persoane afectate de o problemă sesizată"
	},
	"unique_users" : {
	    label : "Utilizatori unici",
	    desc : "Numărul de utilizatori unici care au interacționat cu formularele adăugate"
	},
	"sent" : {
	    label : "Trimise",
	    desc : "Numărul total de trimiteri"
	},
	"registrations" : {
	    label : "Numere înregistrare",
	    desc : "Totalul numerelelor de înregistrare adăugate în aplicație pentru sesizările trimise"
	},
	"responses" : {
	    label : "Răspunsuri primite",
	    desc : "Numărul total de răspunsuri adăugate în aplicație pentru sesizările trimise"
	},
	"resolved" : {
	    label : "Rezolvate",
	    desc : "Câte sesizări au fost marcate de utilizatori ca fiind rezolvate"
	}
    };

    function displayStats(data) {
	var nList = data.notifications;
	var statsCont = $("#statsCont");

	for (var i = 0; i < nList.length; i++) {
	    var nd = nList[i];

	    var ne = statsCont.find("#" + nd.id);
	    var withNames = false;
	    if (ne.length == 0) {
		/* we've goning to use a basic notification template */
		var ne = $("#nTemplate").clone();
		ne.attr('id', nd.id);
		ne.find(".notifHeader").first().html(nd.title);
		var statsE = ne.find(".notifStats");
		statsE.hide();
		statsCont.append(ne);
		ne.show();
		withNames = true;

		
	    }

	    var bodyE = ne.find(".notifBody");

	    var cCont = bodyE.find(".statsBodyCont");

	    if (cCont.length == 0) {
		cCont = $("<div>").addClass("statsBodyCont");
		bodyE.append(cCont);
	    }
	    
	    if(withNames){
		cCont.append(buildCaptionsCont(nd));
	    }

	    var statsEntryCont = buildStatsContainer(nd, withNames);

	    cCont.append(statsEntryCont);

	    // 	    if(n.stats){

	    // 		statsE.append($("<span title='Susținători'>").addClass("statsItem").append($("<i class='statsIcon fas fa-users'></i>")).append(n.stats.extraStats.relevance));
	    // 		statsE.append($("<span title='Prioritate pe zona de impact'>").addClass("statsItem").append($("<i class='statsIcon fas fa-hashtag'></i>")).append(n.stats.extraStats.areaPriority));

	    // 	    }
	    // 	    else{
	    // 		statsE.hide();
	    // 	    }

	}
    }

    function buildCaptionsCont(nd) {

	var sCont = $("#statsTemplate").clone();

	var headerCont = sCont.find(".statsHeader");
	headerCont.append($("<div>").addClass("statsName caption").html(
		"Categorie"));
	sCont.attr("id", nd.id + "-captions");

	var i = 0;
	
	var sBody = sCont.find(".statsBody");

	for ( var sn in statsConfig) {
	    var sc = statsConfig[sn];

	    var label = sc.label;
	    var desc = sc.desc;

	    var rown = $("<div>").addClass("statsCol");
	    rown.attr("id", nd.id + "-" + sn);
	    var nameCont = $("<div>").addClass("statsName").addClass(
		    "alt" + (i % 2));
	    nameCont.append($("<div>").addClass("statText").html(label).attr("title", desc));
	    rown.append(nameCont);
	    sBody.append(rown);

	    i++;
	}
	
	return sCont;
    }

    function buildStatsContainer(nd, withNames) {
	var sd = nd.stats;
	var esd = sd.extraStats;

	var sCont = $("#statsTemplate").clone();

	var typeDesc = eTypesMap[esd.complex_type];
	sCont.attr("id", nd.id + "-" + esd.complex_type);
	var headerCont = sCont.find(".statsHeader");
// 	if (withNames) {
// 	    headerCont.append($("<div>").addClass("statsName caption").html(
// 		    "Categorie"));
// 	}
	headerCont.append($("<div>").addClass("statsVal caption")
		.html(typeDesc));
	delete esd["complex_type"];

	var sBody = sCont.find(".statsBody");

	var i = 0;
	for ( var sn in statsConfig) {
	    var sc = statsConfig[sn];

	    var label = sc.label;
	    var desc = sc.desc;

	    var row = $("<div>").addClass("statsCol");
	    row.attr("id", nd.id + "-" + typeDesc + "-" + sn);
// 	    if (withNames) {
// 		var rown = $("<div>").addClass("statsCol");
// 		rown.attr("id", nd.id + "-" + sn);
// 		var nameCont = $("<div>").addClass("statsName").addClass(
// 			"alt" + (i % 2)).html(label).attr("title", desc);
// 		rown.append(nameCont);
// 		sBody.append(rown);
// 	    }
	    sBody.append(row);
	    var valCont = $("<div>").addClass("statsVal").html(esd[sn])
	    valCont.addClass("alt" + (i % 2));
	    row.append(valCont);
	    i++;
	}
	sCont.show();
	return sCont;
    }

    displayStats(lastData.data);