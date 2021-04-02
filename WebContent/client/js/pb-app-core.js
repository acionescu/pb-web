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

PbAppClient.prototype.getDataFieldAllowedValues=function(data){
    this.send({
	et: "DATAFIELD:VALUES:GET_ALLOWED",
	data:data
    });
}

PbAppClient.prototype.getEntityDataByHash=function(entityHash){
    this.send({
	et: "APP:ENTITY:GET_DATA",
	data: {
	    hash:entityHash
	}
    });
}

function DataFieldController(df){
    /* the datafield object */
    this.df=df;
    /* the html element created for this datafiled */
    this.elem;
    
    /* fields on which this field depends */
    this.dependencies;
    
    /* fields that depend on this field */
    this.dependees;
    
    this.changeListener;
    
    this.dataContext;
    
    this.showing=true;
    
    this.ready=true;
    
    this.init();
    
}

DataFieldController.prototype = Object.create(DataFieldController.prototype);
DataFieldController.prototype.constructor=DataFieldController;


/**
 * Initializes this element after creation.
 * <br>
 * Here allowed values can be pulled from server
 */
DataFieldController.prototype.init = function(){
    log("Initializing "+this.df.id);
    
    var allowedValuesMap = this.df.allowedValuesMap;
    
    if(allowedValuesMap != null){
    
        var rp=allowedValuesMap.ds.requiredParams;
        
        if(rp != null && rp.length > 0){
        	log(this.df.id+" has dependencies "+ rp);
        	this.dependencies={};
        	/* if we have required params, add them as dependencies */
        	for(var i in rp){
        	    this.dependencies[rp[i]]=true;
        	}
        	log(this.df.id+": added dependencies "+this.dependencies);
        }
    }
    
}

/**
 * Override for other types
 */
DataFieldController.prototype.createElement=function(){
    /* by default, it creates a simple input */
    return $("<input>");
}

DataFieldController.prototype.getElement=function(dataContext){
    if(this.elem == null){
	this.elem=this.createElement();
	this.dataContext = dataContext;  
	
	if(this.changeListener != null){
	    /* if we have a change listener set, register it on the created element */
	    this.setupChangeListener(this.changeListener);
	}
	
	/* refresh the object if it has no dependencies */
//	if(this.dependencies == null){
	    this.refresh(dataContext);
//	}
    }
    return this.elem;
}

/**
 * Refresh this field with in a data context
 */
DataFieldController.prototype.refresh=function(dataContext){
   var displayCond = this.df.displayCondition;
   var prevShowing = this.showing;
   
   if(displayCond != null){
       this.showing=PB.testCondition(displayCond,dataContext);
   }
   else{
       this.showing = true;
   }
   
   if(this.showing){
       this.update(dataContext);
       this.elem.parent().parent().show();
   }
   else if(this.elem != null){
       this.elem.parent().parent().hide();
       
       if(prevShowing){
	   /* if this switches from visible to not visible, trigger a change to update dependees */
	   this.elem.change();
       }
   }
   log("refreshed "+this.df.id+" showing="+this.showing);
}

DataFieldController.prototype.update=function(dataContext){
    var valuesMap = this.df.allowedValuesMap;
    if(valuesMap != null){
	/* see if we need to add extra params */
	var extraParams;
	
	var rp=valuesMap.ds.requiredParams;
	
	
	if(rp != null && dataContext != null){
	    /* we have extra params */
	    extraParams={};
	    
	    /* get params id mapping */
	    var rpm = valuesMap.ds.requiredParamsMap;
	    
	    for(var i in  rp){
		/* param id */
		var pid = rp[i];
		/* get param value from data context */
		var pv = dataContext.getFieldValue(pid);
		
		if(pv == null){
		    continue;
		}
		
		if(rpm != null && rpm[pid] != null){
		    /* map param id to a different id */
		    pid = rpm[pid];
		}
		
		extraParams[pid]=pv;
	    }
	}
	
	this.ready=false;
	// get data 
	PB.pbAgent.getDataFieldAllowedValues({dataFieldId:this.df.id, dataSourceId:valuesMap.ds.id, params:extraParams});
	
    }
    else if(this.df.allowedValues != null || this.df.value != null){
	/* if the allowed values are present, populate from those */
	this.populate();
    }
}

/**
 *
 */
DataFieldController.prototype.addDependee=function(fieldController){
    log("add dependee "+fieldController.df.id +" on "+this.df.id);
    if(this.dependees == null){
	this.dependees={};
    }
    
    this.dependees[fieldController.df.id]=fieldController;
    
    var self = this;
    if(this.changeListener == null){
	/* setup a change listener */
	var listener = function(e){
	    log("change listener called on "+self.df.id);
	    for(var did in self.dependees){
		log("refreshing dependee "+did);
		self.dependees[did].refresh(self.dataContext);
	    }
	}
	/* register this listener */
	this.setupChangeListener(listener);
    }
    
}

DataFieldController.prototype.setupChangeListener=function(listener){
    this.changeListener=listener;
    
    if(this.elem != null){
        log("registering change listener on "+this.df.id);
        this.elem.change(listener);
    }
    
}

DataFieldController.prototype.addChangeListener=function(listener){
    var self=this;
    this.elem.change(function(e){
	listener(self);
    })
}

/**
 * Override for specific types
 */
DataFieldController.prototype.populate=function(data){
    
}

/**
 * Override for specific input types
 */
DataFieldController.prototype.getUiValue=function(){
    /* by default return value attribute */
    return this.elem.val();
}

/* gets the data behind a value */
DataFieldController.prototype.getValueData=function(valueId){
    log("get value data for field "+this.df.id+" with value "+valueId);
    if(valueId == null){
	return null;
    }
    if(this.df.allowedValues != null){
	var out;
	this.df.allowedValues.forEach(function(vdf){
//	    log("check value data "+vdf.id +" vs "+valueId);
	    if(vdf.id.toString()===valueId.toString()){
//		log("value match "+JSON.stringify(vdf));
//		out = vdf.value;
		out = vdf;
		return;
	    }
	});
	return out;
    }
    return null;
}

DataFieldController.prototype.buildView=function(dataContext){
    var fieldCont = $("<div>");
    var fieldTitle = $("<div>").addClass("datafield-elem");
    var fieldInfo = $("<div>").addClass("datafield-elem");
    var fieldError=$("<div>").addClass("datafield-elem");
    
    var fe = this.getElement(dataContext);
    
    
    fieldCont.append(fieldTitle);
    fieldCont.append(fieldInfo);
    fieldCont.append(fe);
    fieldCont.append(fieldError);
    
    fieldError.hide();
    
    if(this.df.desc != null){
	fieldTitle.html(this.df.desc);
    }
    
    if(this.df.info != null){
	fieldInfo.html(this.df.info);
    }
    else{
	fieldInfo.hide();
    }
    
    this.initUi();
    
    return fieldCont;
}

/**
 * Form data controller
 * @param dataFields
 * @returns
 */
function FormDataController(dataFields, currentValues){
    /* fields controllers */
    this.fields={};
        
    if(dataFields != null){
	this.initFromDataFields(dataFields, currentValues);
    }
}

FormDataController.prototype = Object.create(FormDataController.prototype);
FormDataController.prototype.constructor=FormDataController;

FormDataController.prototype.initFromDataFields=function(dataFields, currentValues){
    for(var i in dataFields){
	var df = dataFields[i];
	
	/* init with current value */
	if(currentValues != null && currentValues[df.id] != null){
	    df.value = currentValues[df.id];
	}
	
	/* build a controller for this field */
	var dfc = PB.getDataFieldController(df);
	if(dfc == null){
	    log("Error: Failed to create controller for datafield type"+df.inputType);
	}
	this.fields[df.id]=dfc;
    }
        
    
    /* register dependencies */
    for(var i in this.fields){
	var dfc = this.fields[i];
	
	if(dfc.dependencies != null){
	    /* register this field as dependee */
	    for(var did in dfc.dependencies){
		var depController = this.fields[did];
		depController.addDependee(dfc);
	    }
	}
    }
}

/* make this act as a DataContext */
FormDataController.prototype.getFieldValue=function(fieldId){
    log("get field value "+fieldId);
    var fc = this.fields[fieldId];
   
    if(fc != null && fc.ready && fc.showing){
	return fc.getUiValue();
    }
    return null;
}

FormDataController.prototype.getDataForFieldValue=function(fieldId,fieldValue){
    
    var fc = this.fields[fieldId];
    log("getDataForFieldValue fieldId="+fieldId+" fc="+fc);
    if(fc != null && fc.ready && fc.showing){
	return fc.getValueData(fieldValue);
	
    }
    return null;
}

/**
 * Called when field allowed values data is available
 */
FormDataController.prototype.onFieldValuesAvailable = function(data){
    if(data != null){
	 var dfc = this.fields[data.dataFieldId];
	 if(dfc != null){
	     dfc.elem.empty();
	     dfc.populate(data);
	     dfc.ready=true;
	     dfc.elem.change();
	 }
    }
}

/**
 * Builds the view for a form controller
 * Provide a container and optionally a list of commands. Each object from the list should contain a description and 
 * a callback function
 * e.g.:
 * {
 *  "desc" : < label >
 *  "calback" : < a function >
 * }
 */
FormDataController.prototype.buildView=function(container,commands){
    for(var fid in this.fields){
	var fc = this.fields[fid];
	var fCont = fc.buildView(this);
	container.append(fCont);
    }
    
    if(commands != null && commands.length > 0){
	var commandsCont = $("<div>").addClass("form-area");
	
	for(var ci in commands){
	    var cDef = commands[ci];
	    
	    var cView = $("<button>").addClass("datafield-elem");
	    cView.html(cDef.desc);
	    cView.click(cDef.callback);
	    
	    commandsCont.append(cView);
	    
	}
	
	container.append(commandsCont);
    }
    
    return container;
}


var DPARAMS = DPARAMS || {
    
    /* static */
    "0": function(pConfig, dataContext){
	return pConfig.value;
    },
    /* dynamic */
    "1":function(pConfig, dataContext){
	return dataContext.getFieldValue(pConfig.id);
    }

};

var CONDITIONS=CONDITIONS || {
    "comp":function(cond, dataContext){
	var p1Value = PB.getDparamValue(cond.p1, dataContext);
	var p2Value = PB.getDparamValue(cond.p2, dataContext);
	
	
	var co;
	if(p1Value == p2Value){
	    co=0;
	}
	else if(p1Value > p2Value){
	    co=1;
	}
	else{
	    co=-1;
	}
	
	log("testing "+p1Value +" and "+p2Value +" for expected output "+cond.expected+" for context "+dataContext +" with output "+co);
	log("satisfied: "+cond.expected.indexOf(co))
	
	return cond.expected.indexOf(co) >= 0;
    }
};


var PB=PB || {
    MODULES:{},
    VIEWS:{
	TYPES:{
	    "MapAppSection":{
		page:"harta_merg.html"
	    },
	    "UserEntitiesAppSection":{
		page:"entities_list.html"
	    },
	    "AggregatedAppSection":{
		page: "submenu.html"
	    },
	    "StatsAppSection": {
		page:"generic_stats.html"
	    },
	    "UserActionsSection" : {
		page: "actions.html"
	    }
	},
	IDS:{
	    "harta_sesizari":{
		page:"harta_sesizari.html"
	    },
	    "detalii":{
		page:"detalii.html"
	    }
	}
    },
    /* the client agent used to communicate with the server */
    pbAgent:null,
    sectionController:null,
    initData:null,
    logging:true
};

function log(message) {
	if(PB.logging){
		console.log(message);
	}
}

PB.initModules = function(data){
    for(var mid in PB.MODULES){
	var mod = PB.MODULES[mid];
	if(mod.initialized && mod.onAppDataUpdate != null){
	    /* if the module was already initialized, call update */
	    mod.onAppDataUpdate(data);
	}
	else{
	    /* call init if the module was not initialized before */
	    mod.init(data);
	    mod.initialized = true;
	}
    }
}

PB.getViewTypeConfig=function(viewType){
    var viewTypeConfig = PB.VIEWS.TYPES[viewType];
    return viewTypeConfig;
}
PB.getViewTypeConfigById=function(viewId){
    var viewTypeConfig = PB.VIEWS.IDS[viewId];
    return viewTypeConfig;
}

PB.refreshCurrentSection=function(filtersValues){
    /* set url params from filter values */
    PB.CONTROLLER.setFilterParams(filtersValues,true);
    
    var sc = PB.sectionController;
    if(sc != null && sc.refreshSection != null){
	sc.refreshSection(filtersValues);
    }
    
    
}

PB.handleSectionData=function(data, defaultHandler){
    var sc = PB.sectionController;
    if(sc != null && sc.onSectionData != null){
	sc.onSectionData(data);
    }
    else if(defaultHandler != null){
	defaultHandler(data);
    }
}

PB.handlePetitionData=function(data){
    var sc = PB.sectionController;
    log("PB.handlePetitionData called, section controller: "+sc);
    if(sc != null && sc.onPetitionData != null){
	sc.onPetitionData(data);
    }
}

PB.testCondition=function(cond, dataContext){
    var cf = CONDITIONS[cond.type];
    if(cf != null){
	return cf(cond,dataContext);
    }
    return false;
}

PB.filtersListToObject=function(filtersList){
    var out ={};
    if(filtersList != null){
	filtersList.forEach(function(f){
	   out[f.fieldValue.id]=f.fieldValue.value; 
	});
    }
    return out;
}

PB.getDparamValue=function(pConfig, dataContext){
    var pf = DPARAMS[pConfig.type];
    if(pf != null){
	return pf(pConfig,dataContext);
    }
    return null;
}

PB.dataFieldsToInputs={
	
	/* simple text input */
	"0": function(df){
	    var c=new DataFieldController(df);
	    
	    /* override create function  */
	    c.createElement= function(df){
		var s = $("<input>");
		
		return s;
	    },
	    /* override populate function */
	    c.populate= function(data){
		
		if(this.df.value != null){
		    this.elem[0].value = this.df.value;
		}
		
	    },
	    c.getUiValue = function(){
		
		return this.elem.val();
	    }
	    
	    c.initUi=function(){
		this.elem.parent().addClass("text-style");
	    }
	    
	    return c;
	},
	
	/* select/combobox */
	"1" : function(df) {
	    
	    var c=new DataFieldController(df);
	    
	    /* override create function  */
	    c.createElement= function(df){
		var s = $("<select>");
		
		return s;
	    },
	    /* override populate function */
	    c.populate= function(data){
		var values = this.df.allowedValues;
		
		if(data != null){
		    values = data.allowedValues;
		    /* cache values */
		    this.df.allowedValues = values;
		}
		
		
		if(values != null){
		    log("populate elem "+this.elem +" for datafiled "+this.df.id +" with value "+this.df.value);
		    for(var i in values){
			var v=values[i];
			var optionElem=$("<option value="+v.id+">").html(v.desc);
			
			this.elem.append(optionElem);
		    }
		}
		
		if(this.df.value != null){
		    this.elem[0].value = this.df.value;
		}
		
	    },
	    c.getUiValue = function(){
		
		return this.elem.find(":selected").val();
	    }
	    
	    c.initUi=function(){
		this.elem.parent().addClass("select-style");
	    }
	    
	    return c;
	},
	/* simple text input */
	"3": function(df){
	    var c=new DataFieldController(df);
	    
	    /* override create function  */
	    c.createElement= function(df){
		var s = $("<textarea rows='5'>");
		
		return s;
	    },
	    /* override populate function */
	    c.populate= function(data){
		
		if(this.df.value != null){
		    this.elem[0].value = this.df.value;
		}
		
	    },
	    c.getUiValue = function(){
		
		return this.elem.val();
	    }
	    
	    c.initUi=function(){
		this.elem.parent().addClass("text-style");
	    }
	    
	    return c;
	}
	
}

PB.getInputElemetForDataField=function(df){
    var cf = PB.dataFieldsToInputs[df.inputType];
    if(cf != null){
	return cf(df).getElement();
    }
    return null;
}

PB.getDataFieldController=function(df){
    var cf = PB.dataFieldsToInputs[df.inputType];
    if(cf != null){
	return cf(df);
    }
    return null;
}

PB.goHome= function(){
	var firstSectionId = PB.initData.defaultSection;
	if(firstSectionId == null){
	    firstSectionId = PB.initData.sections[0].id;
	}
	log("going home to section "+firstSectionId);
	$("#"+firstSectionId).click();
    }

PB.showInfoMessage = function(message, timeout) {
	var elem = document.getElementById("snackbar");
	if (elem == null) {
	    return;
	}
	elem.innerHTML = message;

	elem.classList.add("show");

	if (timeout == null) {
	    timeout = 3000;
	}

	setTimeout(function() {
	    elem.classList.remove("show");
	}, timeout);
    }