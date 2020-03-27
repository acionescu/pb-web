if (PB.MODULES.AUTH == null) {
    log("init auth module");
    PB.MODULES.AUTH = {
	STATES : {
	    REQUESTING_AUTH : new WsState("REQUESTING_AUTH", {
		"AUTH:SESSION:INIT" : function(ec) {
		    PB.MODULES.AUTH.DATA.actionId = ec.event.data.actionId;
		    PB.MODULES.AUTH.DATA.userAuthInitTimeout = ec.event.data.userAuthInitTimeout;
		    PB.MODULES.AUTH.gotoState(PB.MODULES.AUTH.STATES.SESSION_INIT);
		}
	    }),
	    SESSION_INIT : new WsState("SESSION_INIT", {
		"REMOTE:AUTH:INITIATED" : function(ec) {
		    PB.MODULES.AUTH.DATA.authCode = ec.event.data.authCode;
		    PB.MODULES.AUTH.DATA.userAuthConfirmTimeout = ec.event.data.userAuthConfirmTimeout;
		    PB.MODULES.AUTH.gotoState(PB.MODULES.AUTH.STATES.REMOTE_AUTH_INIT);
		    
		}

	    }),
	    REMOTE_AUTH_INIT : new WsState(
		    "REMOTE_AUTH_INIT",
		    {

			"REMOTE:AUTH:CONFIRMED" : function(ec) {
			  
			    PB.MODULES.AUTH.DATA.authSessionId = ec.event.data.authSessionId;
			    PB.MODULES.AUTH.DATA.alias = ec.event.data.alias;
			    PB.MODULES.AUTH.DATA.authDuration = ec.event.data.authDuration;
			    
			    PB.MODULES.AUTH.gotoState(PB.MODULES.AUTH.STATES.REMOTE_AUTH_CONFIRMED);

			   
			}
		    }),
	    REMOTE_AUTH_CONFIRMED : new WsState("REMOTE_AUTH_CONFIRMED", {}),
	    REQUESTING_RELEASE : new WsState("REQUESTING_RELEASE", {
		"REMOTE:AUTH:RELEASED": function(ec){
		    PB.MODULES.AUTH.reset();
		    handleLogout();
		}
		
	    })
	},
	STATE : null,
	DATA : {

	},
	
	gotoState: function(newState){
	     if(this.STATE != null && this.STATE.onExit){
		 this.STATE.onExit(this.DATA);
	     }
	     this.STATE = newState;
	     if(this.STATE.init){
		 this.STATE.init(this.DATA);
	     }
	},
	
	handleEvent: function(ec){
	    PB.MODULES.AUTH.STATE.handle(ec);
	},

	init : function(initData) {
	    PB.pbAgent.activeState.registerHandler("AUTH:SESSION:INIT",this.handleEvent);

	    PB.pbAgent.activeState.registerHandler("REMOTE:AUTH:INITIATED",this.handleEvent);

	    PB.pbAgent.activeState.registerHandler("REMOTE:AUTH:CONFIRMED",this.handleEvent);
	    
	    PB.pbAgent.activeState.registerHandler("REMOTE:AUTH:RELEASED",this.handleEvent);
	    
	    PB.pbAgent.activeState.registerHandler("AUTH:SESSION:CANCELED",handleSessionCanceled);
	    
	    /* initiating states */
	    this.STATES.SESSION_INIT.init =  handleAuthInit;
	    this.STATES.REMOTE_AUTH_INIT.init = handleRemoteAuthInit;
	    this.STATES.REMOTE_AUTH_CONFIRMED.init =  handleRemoteAuthConfirmed;
	},

	requestAuth : function(req) {

	    log("Request user auth: " + JSON.stringify(req));
	    this.STATE = this.STATES.REQUESTING_AUTH;
	    PB.pbAgent.send({
		et : "USER:AUTH:REQUEST",
		data : req
	    });
	},
	
	logout: function(){
	    log("logout request");
	    PB.MODULES.AUTH.STATE = PB.MODULES.AUTH.STATES.REQUESTING_RELEASE;
	    
	    var data = PB.MODULES.AUTH.DATA;
	    
	    PB.pbAgent.send({
		et : "AUTH:RELEASE:REQUEST",
		data : data
	    });
	},

	reset : function() {
	    this.STATE = null;
	    this.DATA = {};
	}
    };
    
    function generateQRCode(text){
	      var qrcode = new QRCode(document.getElementById("qrcode"), {
			text: text,
			width: 128,
			height: 128,
			colorDark : "#000000",
			colorLight : "#ffffff",
			correctLevel : QRCode.CorrectLevel.H
		});
	  }
	  
	  
	  function handleAuthInit(data){
	      
	      /* generate an auth token composed from the session id received form the server and the secret code */
	      var authToken=data.actionId;
	      
	      $("#qrcode").show();
	      
	      /* generate a qr code with the token and display it to the user*/
	      generateQRCode(authToken);
	      
	      log("actionId="+data.actionId);
	      
	      $("#msgCont").html("Scanează codul QR de mai jos, cu aplicația de mobil <a href='https://segoia.ro#apps'>Panoul de Bord</a>, pentru a te autentifica.")
	      
	      if(!JSUTIL.isIntervalStarted("authInitInt")){
        	      var delay =1000;
        	      var timelapse=0;
        	      var startTime = new Date().getTime();
        	      var remained = data.userAuthInitTimeout;
        	      	      
        	      var updateFunc = function(){
        		  
        		  if(remained <= 0){
        		      JSUTIL.clearInterval("authInitInt");
        		      
        		  }
        		  
        		  remained = data.userAuthInitTimeout -  (new Date().getTime()-startTime);
                	      var duration = JSUTIL.timeIntervalToText(remained,[1000,60],["s","m"]);
                	      log("auth init timeout: "+data.userAuthInitTimeout);
                	      $("#postMsgCont").html("Timp rămas: "+duration);
        	      }
        	      updateFunc();
        	      
        	      JSUTIL.setInterval("authInitInt",updateFunc, delay);
	      }
	  }
	  
	  function handleRemoteAuthInit(data){
	      
	      var passCode = data.authCode;
	      var pcc = $("#passCodeCont");
	      pcc.show();
	      pcc.html(passCode);
	      $("#qrcode").hide();
	  }
	  
	  function handleRemoteAuthConfirmed(data){
	      $("#msgCont").html("Autentificare cu succes!");
	      $("#qrcode").hide();
	      $("#passCodeCont").hide();
	      
	      var sections = $("#sectionsHeader");
	      sections.find("#login").hide();
	      
	      sections.find("#account").show();      
	      
	  }
	  
	  function handleLogout(){
	      var sections = $("#sectionsHeader");
	      sections.find("#login").show();
	      
	      sections.find("#account").hide();      
	  }
	  
	  function handleSessionCanceled(ec){
	      PB.MODULES.AUTH.reset();
	      $("#qrcode").empty();
	      $("#postMsgCont").empty();
	      $("#msgCont").html("Timpul a expirat. <a onclick=PB.MODULES.AUTH.requestAuth()>Încearcă din nou</a>.");
	      
	  }

}