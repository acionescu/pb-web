function handleEntityData(b){log("handing petition data "+b);var a=$("#contentBody");a.empty();if(b!=null){var c=buildNotifElement(b);log("append notif element");a.append(c);c.show()}}PB.sectionController={onPetitionData:function(a){log("handle petition data");handleEntityData(a)}};var teh=PB.CONTROLLER.getParam("teh");if(teh!=null){PB.pbAgent.getEntityDataByHash(teh)}else{PB.goHome()};