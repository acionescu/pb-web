var NODEVM = NODEVM || {
    /* define a helper object */
    HELPER: {
	
	function byteArraytoString(byteArray){
	    return window.btoa(String.fromCharCode.apply(null, new Uint8Array(byteArray)));
	}

	async function genRandomNumber(){
	    var current_date = (new Date()).valueOf().toString();
	    var random = Math.random().toString();

	    let result = await crypto.subtle.digest('SHA-256', new TextEncoder("utf-8").encode(current_date + random));
	    return result;
	};

	function getRandomHash(handler){
	    var p=genRandomNumber();
	    /* call handler if not null */
	    if(handler != null){
		p.then( rn => {
		    handler(byteArraytoString(rn));
		});
	    }
	    /* return promise for later use */
	    return p;
	};
    },
    CRYPTO : {
	generateKeyPair: function(){
	    var onKeyPairReady =   window.crypto.subtle.generateKey(
		    	   {
			      name: "RSASSA-PKCS1-v1_5",
			      modulusLength: 1024,
			      publicExponent: new Uint8Array([1, 0, 1]),
			      hash: "SHA-256",
			    },
			    true,
			    ["sign", "verify", "encrypt", "decrypt"]
			  );
	    /* return the promise */
	    return onKeyPairReady;
	}
    }
    
};

/**
 * Defines a node capable of exchanging events with other peer nodes and also
 * handle internal events via one or multiple event buses
 */
function EventNode(config, autoinit) {
    this.config = config;
    this.autoinit = autoinit;
    
    this.nodeInfo;
    this.securityManager;
    this.peersManager;
    
    if(autoinit){
	this.init();
    }
}

EventNode.prototype = Object.create(EventNode.prototype);
EventNode.prototype.constructor = EventNode;


EventNode.prototype.init = function(){
    if(config == null){
	throw "Can't init with null config";
    }
    
    this.registerHandlers();
    this.nodeConfig();
    this.nodeInit();
}

EventNode.prototype.registerHandlers=function(){
    
}

EventNode.prototype.nodeConfig=function(){
    var self = this;
    var securityConfig = config.securityConfig;
    
    /* create node info */
    NODEVM.HELPER.getRandomHash().then(hash => {
	self.nodeInfo = {
		nodeId: hash,
		nodeAuth:securityConfig.nodeAuth,
		securityPolicy:securityConfig.securityPolicy
	};
    });
}

EventNode.prototype.nodeInit=function(){
    
}

/**
 * Provides the context for an
 * 
 * @EventNode
 * @param config
 * @returns
 */
function EventNodeContext(node) {
    this.node = node;
}

EventNodeContext.prototype = Object.create(EventNodeContext.prototype);
EventNodeContext.prototype.constructor = EventNodeContext;




/**
 * Manages security for an
 * 
 * @EventNode
 * @param config
 * @returns
 */
function EventNodeSecurityManager(node) {
    this.node = node;
}

EventNodeSecurityManager.prototype = Object.create(EventNodeSecurityManager.prototype);
EventNodeSecurityManager.prototype.constructor = EventNodeSecurityManager;

EventNodeSecurityManager.prototype.init=function(){
    
}



/**
 * Manages peers for an
 * 
 * @EventNode
 * @param config
 * @returns
 */
function PeersManager(node) {
    this.node = node;
}

PeersManager.prototype = Object.create(PeersManager.prototype);
PeersManager.prototype.constructor = PeersManager;


