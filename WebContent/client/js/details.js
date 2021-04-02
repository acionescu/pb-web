
function handleEntityData(data) {
    log("handing petition data " + data);
    var contentBody = $("#contentBody");

    contentBody.empty();

    if (data != null) {
	    var ne = buildNotifElement(data);
	    log("append notif element");
	    contentBody.append(ne);
	    ne.show();
    }
}

PB.sectionController = {

    onPetitionData : function(data) {
	log("handle petition data");
	handleEntityData(data);
    }
};

var teh = PB.CONTROLLER.getParam("teh");
if (teh != null) {
    PB.pbAgent.getEntityDataByHash(teh);
} else {
    PB.goHome();
}