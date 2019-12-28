function PbAppClient(e,t,n,l){EventWsEndpoint.call(this,e,t,n,l)}function DataFieldController(e){this.df=e,this.elem,this.dependencies,this.dependees,this.changeListener,this.dataContext,this.showing=!0,this.ready=!0,this.init()}function FormDataController(e){this.fields={},null!=e&&this.initFromDataFields(e)}PbAppClient.prototype=Object.create(EventWsEndpoint.prototype),(PbAppClient.prototype.constructor=PbAppClient).prototype.doAppInit=function(){this.send({et:"APP:INIT:REQUEST"})},PbAppClient.prototype.refreshSection=function(e){this.send({et:"APP:SECTION:REFRESH_REQUEST",data:e})},PbAppClient.prototype.getDataFieldAllowedValues=function(e){this.send({et:"DATAFIELD:VALUES:GET_ALLOWED",data:e})},DataFieldController.prototype=Object.create(DataFieldController.prototype),(DataFieldController.prototype.constructor=DataFieldController).prototype.init=function(){log("Initializing "+this.df.id);var e=this.df.allowedValuesMap;if(null!=e){var t=e.ds.requiredParams;if(null!=t&&0<t.length){for(var n in log(this.df.id+" has dependencies "+t),this.dependencies={},t)this.dependencies[t[n]]=!0;log(this.df.id+": added dependencies "+this.dependencies)}}},DataFieldController.prototype.createElement=function(){return $("<input>")},DataFieldController.prototype.getElement=function(e){return null==this.elem&&(this.elem=this.createElement(),this.dataContext=e,null!=this.changeListener&&this.setupChangeListener(this.changeListener),this.refresh(e)),this.elem},DataFieldController.prototype.refresh=function(e){var t=this.df.displayCondition,n=this.showing;this.showing=null==t||PB.testCondition(t,e),this.showing?(this.update(e),this.elem.parent().parent().show()):null!=this.elem&&(this.elem.parent().parent().hide(),n&&this.elem.change()),log("refreshed "+this.df.id+" showing="+this.showing)},DataFieldController.prototype.update=function(e){var t=this.df.allowedValuesMap;if(null!=t){var n,l=t.ds.requiredParams;if(null!=l&&null!=e){n={};var i=t.ds.requiredParamsMap;for(var o in l){var r=l[o],a=e.getFieldValue(r);null!=a&&(null!=i&&null!=i[r]&&(r=i[r]),n[r]=a)}}this.ready=!1,PB.pbAgent.getDataFieldAllowedValues({dataFieldId:this.df.id,dataSourceId:t.ds.id,params:n})}else null!=this.df.allowedValues&&this.populate()},DataFieldController.prototype.addDependee=function(e){log("add dependee "+e.df.id+" on "+this.df.id),null==this.dependees&&(this.dependees={}),this.dependees[e.df.id]=e;var n=this;if(null==this.changeListener){this.setupChangeListener(function(e){for(var t in log("change listener called on "+n.df.id),n.dependees)log("refreshing dependee "+t),n.dependees[t].refresh(n.dataContext)})}},DataFieldController.prototype.setupChangeListener=function(e){this.changeListener=e,null!=this.elem&&(log("registering change listener on "+this.df.id),this.elem.change(e))},DataFieldController.prototype.addChangeListener=function(t){var n=this;this.elem.change(function(e){t(n)})},DataFieldController.prototype.populate=function(e){},DataFieldController.prototype.getUiValue=function(){return this.elem.val()},DataFieldController.prototype.getValueData=function(t){return log("get value data for field "+this.df.id+" with value "+t),null==t?null:null==this.df.allowedValues?null:(this.df.allowedValues.forEach(function(e){e.id.toString()!==t.toString()||(n=e.value)}),n);var n},FormDataController.prototype=Object.create(FormDataController.prototype),(FormDataController.prototype.constructor=FormDataController).prototype.initFromDataFields=function(e){for(var t in e){var n=e[t],l=PB.getDataFieldController(n);this.fields[n.id]=l}for(var t in this.fields){if(null!=(l=this.fields[t]).dependencies)for(var i in l.dependencies){this.fields[i].addDependee(l)}}},FormDataController.prototype.getFieldValue=function(e){log("get field value "+e);var t=this.fields[e];return null!=t&&t.ready&&t.showing?t.getUiValue():null},FormDataController.prototype.getDataForFieldValue=function(e,t){var n=this.fields[e];return null!=n&&n.ready&&n.showing?n.getValueData(t):null},FormDataController.prototype.onFieldValuesAvailable=function(e){if(null!=e){var t=this.fields[e.dataFieldId];null!=t&&(t.elem.empty(),t.populate(e),t.ready=!0,t.elem.change())}};var DPARAMS=DPARAMS||{0:function(e,t){return e.value},1:function(e,t){return t.getFieldValue(e.id)}},CONDITIONS=CONDITIONS||{comp:function(e,t){var n,l=PB.getDparamValue(e.p1,t),i=PB.getDparamValue(e.p2,t);return n=l==i?0:i<l?1:-1,log("testing "+l+" and "+i+" for expected output "+e.expected+" for context "+t+" with output "+n),log("satisfied: "+e.expected.indexOf(n)),0<=e.expected.indexOf(n)}},PB=PB||{MODULES:{},VIEWS:{TYPES:{MapAppSection:{page:"harta_merg.html"},UserEntitiesAppSection:{page:"entities_list.html"}}},pbAgent:null,sectionController:null,logging:!1};PB.initModules=function(e){for(var t in PB.MODULES)PB.MODULES[t].init(e)},PB.getViewTypeConfig=function(e){return PB.VIEWS.TYPES[e]},PB.refreshCurrentSection=function(e){var t=PB.sectionController;null!=t&&null!=t.refreshSection&&t.refreshSection(e)},PB.testCondition=function(e,t){var n=CONDITIONS[e.type];return null!=n&&n(e,t)},PB.filtersListToObject=function(e){var t={};return null!=e&&e.forEach(function(e){t[e.fieldValue.id]=e.fieldValue.value}),t},PB.getDparamValue=function(e,t){var n=DPARAMS[e.type];return null!=n?n(e,t):null},PB.dataFieldsToInputs={1:function(e){var t=new DataFieldController(e);return t.createElement=function(e){return $("<select>")},t.populate=function(e){var t=this.df.allowedValues;if(null!=e&&(t=e.allowedValues,this.df.allowedValues=t),null!=t)for(var n in log("populate elem "+this.elem+" for datafiled "+this.df.id),t){var l=t[n],i=$("<option value="+l.id+">").html(l.desc);this.elem.append(i)}null!=this.df.value&&(this.elem[0].value=this.df.value)},t.getUiValue=function(){return this.elem.find(":selected").val()},t.initUi=function(){this.elem.parent().addClass("select-style")},t}},PB.getInputElemetForDataField=function(e){var t=PB.dataFieldsToInputs[e.inputType];return null!=t?t(e).getElement():null},PB.getDataFieldController=function(e){var t=PB.dataFieldsToInputs[e.inputType];return null!=t?t(e):null};