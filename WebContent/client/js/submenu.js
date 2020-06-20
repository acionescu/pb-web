log("loaded submenu.js");

var se = currentSectionData.subentities;

/* use this to store the data for the last loaded subsection */
var lastData;

function populateSections(se, cont) {
    if (se == null) {
	return;
    }

    cont.empty();

    for (var i = 0; i < se.length; i++) {
	var e = se[i];
	var o = $("<option>").val(e.id).html(e.label);
	console.log("add se " + e.id + " " + e.label);
	cont.append(o);
    }
}

populateSections(se, $("#subsections"));

function handleData(data) {
    handleSubsectionData(data);
}

function handleSubsectionData(data) {
    lastData = data;
    var cont = $("#subentityContent");
    cont.empty();

    var viewTypeConfig;
    if (data.id != null) {

	viewTypeConfig = PB.getViewTypeConfigById(data.id);
    }

    if (viewTypeConfig == null && data.type != null) {
	viewTypeConfig = PB.getViewTypeConfig(data.type);
    }
    console.log("using view config " + viewTypeConfig);
    if (viewTypeConfig != null && viewTypeConfig.page != null) {
	cont.load("./client/" + viewTypeConfig.page, 'f'
		+ (Math.random() * 1000000));
    }
}

function loadSubsection(filtersValues) {
    var sel = $("#subsections").val();

    PB.pbAgent.refreshSection({
	sectionId : sel,
	startItem : 0,
	itemCount : 100,
	filtersList : filtersValues
    });
}

PB.sectionController = {

    refreshSection : function(filtersValues) {
	$("#contentBody").empty();
	$("#filtersCont").hide();
	/* remove old scroll */
	removeInfiniteScroll();

	// /* make sure we set refreshing flag on, so that scroll listener won't
	// try to refresh the page as well */
	// sectionRefreshing = true;

	// PB.pbAgent.refreshSection({
	// sectionId : currentSectionData.id,
	// startItem : 0,
	// itemCount : 100,
	// filtersList : filtersValues
	// });
    },

    onSectionData : function(data) {
	handleData(data);
    }
};

loadSubsection(null);