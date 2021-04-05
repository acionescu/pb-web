var EBUS=EBUS||{logging:false,WS:{STATES:{},STATS:{instantiated:0}}};function WsState(b,a){this.name;this.handlers=a;this.extraHandlers={}}WsState.prototype=Object.create(WsState.prototype);WsState.prototype.constructor=WsState;WsState.prototype.handle=function(a){var b=this.handlers[a.event.et];if(b){b(a)}var c=this.extraHandlers[a.event.et];if(c&&c.nh){c.nh.forEach(function(d){try{d(a)}catch(f){self.log("error: "+f+"handler: "+d)}})}};WsState.prototype.registerHandler=function(b,a){var c=this.extraHandlers[b];if(c==null){c={nh:[]};this.extraHandlers[b]=c}c.nh.push(a)};EBUS.WS.STATES.OPENED=new WsState("OPENED",{"EBUS:PEER:CONNECTED":function(a){a.wse.remoteId=a.event.params.clientId;var b={et:"EBUS:PEER:AUTH",params:{clientId:a.event.params.clientId}};a.wse.state=EBUS.WS.STATES.CONNECTED;a.wse.send(b)}});EBUS.WS.STATES.CONNECTED=new WsState("CONNECTED",{"EBUS:PEER:AUTHENTICATED":function(a){a.wse.active=true;a.wse.state=a.wse.activeState;a.wse.activeState.handle(a)}});function EventWsEndpoint(a,d,c,b){this.id="WSE-"+ ++EBUS.WS.STATS.instantiated;this.url=a;this.handlers=[this];this.activeState=b;if(c){this.handlers.push(c)}this.ws;this.state;this.remoteId;this.data={};this.lastEvent;this.active;if(d){this.connect()}}EventWsEndpoint.prototype=Object.create(EventWsEndpoint.prototype);EventWsEndpoint.prototype.constructor=EventWsEndpoint;EventWsEndpoint.prototype.connect=function(){if("WebSocket" in window){this.ws=new WebSocket(this.url)}else{if("MozWebSocket" in window){this.ws=new MozWebSocket(this.url)}else{throw"WebSocket is not supported by this browser."}}this.bindWs()};EventWsEndpoint.prototype.close=function(){if(this.ws){this.ws.close();this.ws=null}};EventWsEndpoint.prototype.handlersDelegate=function(b){var a=this;return function(){a.callHandlers(b,arguments)}};EventWsEndpoint.prototype.callHandlers=function(c,b){var a=this;this.handlers.forEach(function(d){try{d[c].apply(d,b)}catch(f){a.log("error: "+f+"handler: "+d+" func: "+c)}})};EventWsEndpoint.prototype.bindWs=function(){this.ws.onopen=this.handlersDelegate("onopen");this.ws.onclose=this.handlersDelegate("onclose");this.ws.onmessage=this.handlersDelegate("onmessage");this.ws.onerror=this.handlersDelegate("onerror")};EventWsEndpoint.prototype.log=function(a){if(EBUS.logging){console.log(this.id+" : "+a)}};EventWsEndpoint.prototype.send=function(b){var a=JSON.stringify(b);this.log("sending: "+a);this.ws.send(a)};EventWsEndpoint.prototype.onopen=function(){this.state=EBUS.WS.STATES.OPENED;this.log("opened")};EventWsEndpoint.prototype.onclose=function(a){this.log("closed -> "+a)};EventWsEndpoint.prototype.onmessage=function(c){this.log("receiving: "+c.data);var d=c.data;if(d instanceof Blob){var a=new FileReader();var b=this;a.onload=function(){b.handleEvent(a.result)};a.readAsText(d)}else{this.handleEvent(d)}};EventWsEndpoint.prototype.handleEvent=function(a){this.log("handling: "+a);this.lastEvent=JSON.parse(a);if(this.state!=null){this.state.handle({event:this.lastEvent,wse:this})}};EventWsEndpoint.prototype.onerror=function(a){this.log("error: "+a)};