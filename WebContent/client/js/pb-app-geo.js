if (PB.MODULES.GEO == null) {
    console.log("init geo namespace");
    PB.MODULES.GEO = {

	init : function(initData) {
	    PB.pbAgent.activeState.registerHandler("GEO:DATA:TRAFFIC_DENSITY",
		    function(ec) {
			
			handleTrafficDensityData(ec);
		    });
//	    console.log("registered geo data handler");
	},

	getTrafficDensity : function(req) {
	    if(req.daysOfWeek != null){
		req.daysOfWeek = [req.daysOfWeek];
	    }
	    log("Get traffic density for request: "+JSON.stringify(req));
	    PB.pbAgent.send({
		et : "GEO:GET:TRAFFIC_DENSITY",
		data : req
	    });
	}
    };

}