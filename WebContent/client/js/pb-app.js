function PbAppClient(url, autoConnect, handler, activeState) {
    EventWsEndpoint.call(this, url, autoConnect, handler, activeState);
}

PbAppClient.prototype = Object.create(EventWsEndpoint.prototype);

PbAppClient.prototype.constructor = PbAppClient;

PbAppClient.prototype.doAppInit=function(){
    this.send({
	et : "APP:INIT:REQUEST"
    });
}

PbAppClient.prototype.refreshSection=function(data){
    this.send({
	et : "APP:SECTION:REFRESH_REQUEST",
	data:data
    });
}