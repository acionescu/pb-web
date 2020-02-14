    //     var agentsCount = 100;
    var agentActionDelay = 0;
    var agentStartDelay = 200;

    $(document).ready(function() {
	// 	updateTarget("/ogeg/ws/web/v0/events");

	$('.toggle-nav').click(function(e) {
	    $(this).toggleClass('active');
	    $('.menu ul').toggleClass('active');

	    e.preventDefault();

	});

    });

    var agents = [];

    var startInterval;

    var sectionRefreshing = false;

    sectionsData = {};

    var lastScrollFunc;
    
    var sectionFilters ={};
    
    var currentSectionData;
    
    var filtersController;
    
    /* values of filters on last refresh */
    var lastRefreshFilters={};

    var wsHandler = {
	onopen : function() {
	    //                 setConnected(true);
	    //                 $("#infoCont").hide();
	    log('Info: WebSocket connection opened.');
	},
	onmessage : function(event) {
	    log('Received: ' + event.data);
	},
	onclose : function(event) {
	    //                 setConnected(false);
	    var msg = 'WebSocket connection closed, Code: ' + event.code
		    + (event.reason == "" ? "" : ", Reason: " + event.reason);

	    $("#infoCont").text(msg).show();
	    log(msg);
	}
    };

    var clientActiveState = new WsState("ACTIVE", {
	"EBUS:PEER:AUTHENTICATED" : function(ec) {
	    log("connection active");
	    $("#infoCont").text("connection active").show();
	    PB.pbAgent.doAppInit();
	},
	"APP:INIT:DATA" : function(ec) {
	    log("init data: " + ec.event.data);
	    initSections(ec.event.data);
	},
	"SECTION:NOTIFICATIONS:REFRESH" : function(ec) {

//	    refreshPublicUserDataSection(ec.event.data);
	    
	    PB.handleSectionData(ec.event.data, refreshPublicUserDataSection);
	    
	    sectionRefreshing = false;
	}
	
	,"DATAFIELD:VALUES:ALLOWED_DATA" : function(ec) {
	    var data = ec.event.data;
	    /* see if we have active filters expecting this data */
	    var f = sectionFilters[data.dataFieldId];
	    if(f != null){
		log("empty value  for "+f.df.id+" is "+data.emptyValueDesc);
		if(!f.df.required && data.emptyValueDesc != null){
		    
		    /* add empty value element */
		    data.allowedValues.unshift({id:data.emptyValue, desc:data.emptyValueDesc})
		}
		/* populate filter from data */
// 		f.populate(data);
		
		filtersController.onFieldValuesAvailable(data);
	    }
	}
    });

    function log(message) {
	if(PB.logging){
		console.log(message);
	}
    }

    function startTest(target) {
	if (target == null) {
	    target = document.getElementById('target').value;
	}
	startAgent(target, wsHandler, clientActiveState);
    }

    function stopTest() {
	agents.forEach(function(a) {
	    a.close();
	});
    }

    function startAgent(target, handler, state) {
	PB.pbAgent = new PbAppClient(target, false, handler, state);
	agents.push(PB.pbAgent);
	PB.pbAgent.connect();

    }

    function updateTarget(target) {
	if (window.location.protocol == 'http:') {
	    document.getElementById('target').value = 'ws://'
		    + window.location.host + target;
	} else {
	    document.getElementById('target').value = 'wss://'
		    + window.location.host + target;
	}
    }

    function getTargetUrl(uri) {
	if (window.location.protocol == 'http:') {
	    return 'ws://' + window.location.host + uri;
	} else {
	    return 'wss://' + window.location.host + uri;
	}
    }

    function initInfiniteScroll(refreshFunc) {
	var win = $(window);
	lastScrollFunc = function() {
	    log("refresh after scroll");
	    // End of the document reached?
	    if (sectionRefreshing) {
		return;
	    }
	    if ($(document).height() - win.height() * 1.3 <= win.scrollTop()) {
		sectionRefreshing = true;
		refreshFunc();
	    }
	};
	// Each time the user scrolls
	win.scroll(lastScrollFunc);
    }

    function removeInfiniteScroll() {
	$(window).off("scroll", lastScrollFunc);
    }

    function initSections(data) {
	PB.initModules(data);
	
	var sHeader = $("#sectionsHeader");
	// 	var sc = $("#sections");

	var about = $("#despre");

	var sArray = [];

	for ( var i in data.sections) {
	    var s = data.sections[i];
	    sectionsData[s.id] = s;
	    log("adding section " + s.id);
	    var h = $("<li><a href='#"+s.id+"'><span>" + s.label
		    + "</span></a></li>");
	    h.attr('id', s.id);

	    about.before(h);

	    // 	    var se = $("<div id='"+s.id+"'/>");
	    // 	    se.addClass("sectionContent");
	    // 	    var sDesc = $("<div>").addClass("sectionDesc").html(s.desc);
	    // 	    se.append(sDesc);
	    // 	    sc.append(se);
	    sArray.push(s.id);

	}

	$(".menu ul li").click(
		function(e) {
		    $(".menu ul .current-item").toggleClass("current-item");
		    $(this).toggleClass("current-item");
		    var cid = $(this).attr('id');
		    log("selected: " + cid);

		    $("#contentDesc").empty();
		    $("#contentBody").empty();
		    
		    var sData = sectionsData[cid];
		    currentSectionData=sData;
		    removeInfiniteScroll();
		    if (sData) {
			if(sData.filters){
			    setupSectionFilters(sData.filters);
			}
			else{
			    $("#contentFilters").hide();
			}
			
			/* set page descpription */
			$("#contentDesc").html(sData.desc);
			
			/* viewTypeconfig */
			var viewTypeConfig;
			log("Try to get view config for id "+sData.id);
			if(sData.id != null){
			    
			    viewTypeConfig = PB.getViewTypeConfigById(sData.id);
			}
			
			if(viewTypeConfig == null && sData.type != null){
			    viewTypeConfig = PB.getViewTypeConfig(sData.type);
			}
			
			if(viewTypeConfig != null && viewTypeConfig.page != null){
				$("#contentBody").load(
					"./client/"+viewTypeConfig.page, 'f' + (Math.random()*1000000));
			}
// 			else{
// 				initInfiniteScroll(getSectionRefreshFunction(cid, 10));
	
// 				PB.pbAgent.refreshSection({
// 				    sectionId : cid,
// 				    startItem : 0,
// 				    itemCount : 10
// 				});
// 		    	}
		    } else {
			$("#contentFilters").hide();
			
			$("#contentDesc").html($(this).text());
			
			$("#contentBody").load(
				"./client/"
					+ $(this).find("a").first()
						.attr('href').substr(1)
					+ ".html", 'f' + (Math.random()*1000000));
		    }
		    window.location.hash = '#' + cid;
		    
		    /* hide menu on click in mobile mode */
		    if(!$(".toggle-nav").hasClass("active")){
			$(".toggle-nav").addClass('active');
			$('.menu ul').addClass('active');
		    }
		    
		    
		});

	var fragment = window.location.hash;
	/* first init */
	log("fragment="+fragment);
	if(fragment == null || fragment.length < 2){
	    $(".menu ul li").first().click();
	}
	else{
	    var selSection=$(".menu ul").find(fragment);
	    log("selected section: "+selSection +" length: "+selSection.length);
	    if(selSection.length > 0){
	    	selSection.first().click();
	    }
	    else{
		$(".menu ul li").first().click();
	    }
	}
	
	

	
    }
    
    function refreshCurrentSection(){
	
	/* reset last filters values */
	lastRefreshFilters={};
	var filtersValues = getFiltersValues();
	log("refreshing current section");
	PB.refreshCurrentSection(filtersValues);
	
// 	/* remove old scroll */
// 	removeInfiniteScroll();
	
// 	/* make sure we set refreshing flag on, so that scroll listener won't try to refresh the page as well */
// 	sectionRefreshing=true;
	
// 	log("refresh with filters: "+filtersValues);
// 	PB.pbAgent.refreshSection({
// 	    sectionId : currentSectionData.id,
// 	    startItem : 0,
// 	    itemCount : 10,
// 	    filtersList: filtersValues
// 	});
	
// 	/* init scroll with new filters */
// 	initInfiniteScroll(getSectionRefreshFunction(currentSectionData.id, 10, filtersValues));
	
	$("#sfBtn").attr("disabled",true);
    }
    
    function getFiltersValues(){
	var values=[];
	
	for(var i in sectionFilters){
	    var f = sectionFilters[i];
	    if(!f.showing){
		continue;
	    }
	    var fv = f.getUiValue();
	    if(fv !== 'undefined'){
	    	values.push({fieldValue:{id:f.df.id, value:fv}});
	    	lastRefreshFilters[f.df.id]=fv;
	    }
	}
	return values;
    }
    
    /**
    * Expects a FormTemplateEntity object
    */
    function setupSectionFilters(filtersData){
	sectionFilters={};
	
	var filtersE = $("#contentFilters").addClass("filtersContaier");
	filtersE.empty();
	
	var fList=filtersData.requiredData;
	
	
	filtersController = new FormDataController(fList);
	
	sectionFilters=filtersController.fields;
	
	
	log("adding "+fList.length +" filters");
	for(var i in sectionFilters){
	    var fc = sectionFilters[i];
	    
	    log("Processing filter "+fc.df.id);
	    
	    var fe = buildFilterElement(fc,filtersController);
	    
	    
	    if(fe != null){
		if(fc.showing){
		    fe.show();
		}
		else{
		    fe.hide();
		}
	    	filtersE.append(fe);
	    	fc.initUi();
	    	
	    	fc.addChangeListener(function(ec){
	    	   log(ec.df.id+" has changed"); 
	    	   
	    	   if(lastRefreshFilters[ec.df.id] != ec.getUiValue()){
	    	       $("#sfBtn").attr("disabled",false);
	    	   }
	    	});
	    }
	}
	
	if(filtersE.children().length > 0){
	    var btnCont= $("<div>").addClass("filterCont");
	    var filterBtn = $("<button id='sfBtn'>").addClass("filterBtn").text("Filtrează");
	    btnCont.append(filterBtn);
	    
	    
	    filterBtn.click(function(e){
		refreshCurrentSection();
	    });
	    
	    filtersE.append(btnCont);
	    
// 	    /* start with filtering button disabled */
// 	    filterBtn.attr("disabled",true);
	    
	    filtersE.show();
	    
	}
	else{
	    filtersE.hide();
	}
    }
    
    /*
    * Expects a DataField object
    */
    function buildFilterElement(fc, dataContext){
	var filterCont= $("<div>").addClass("filterCont"); 
	var titleElem = $("<div>").addClass("filterTitle").html(fc.df.desc);
	
	if(fc == null){
	    return null;
	}
	var fe = fc.getElement(dataContext);
	log("got element "+fe +" for filter "+fc.df.id);
	
	filterCont.append(titleElem);
	var ec =$("<div>");
	ec.append(fe);
	
	filterCont.append(ec);
	
	
	
	return filterCont;
    }

    function getSectionRefreshFunction(sid, itemCount, filterValues) {
	return function() {
	    log("calling refresh for section " + sid);
	    PB.pbAgent.refreshSection({
		sectionId : sid,
		startItem : $("#contentBody").children().length,
		itemCount : itemCount,
		filtersList: filterValues
	    });
	}
    }

    function refreshPublicUserDataSection(data) {
	for ( var i in data.data.notifications) {
	    var n = data.data.notifications[i];
	    var ne = $("#nTemplate").clone();
	    ne.attr('id', "notif-" + $("#contentBody").children().length);
	    var content = n.content.replace(/\n/g, "<br/>");
	    ne.find(".notifHeader").first().html(
		    "Către: " + n.targetInstitutionName);
	    var bodyE=ne.find(".notifBody");
	    
	    var statsE = ne.find(".notifStats");
	    if(n.stats){
		
		statsE.append($("<span title='Susținători'>").addClass("statsItem").append($("<i class='statsIcon fas fa-users'></i>")).append(n.stats.extraStats.relevance));
		statsE.append($("<span title='Prioritate pe zona de impact'>").addClass("statsItem").append($("<i class='statsIcon fas fa-hashtag'></i>")).append(n.stats.extraStats.areaPriority));

	    }
	    else{
		statsE.hide();
	    }
	    
	    bodyE.append($("<div>").html(content));

	    // 	    $("#" + data.id).append(ne);
	    $("#contentBody").append(ne);
	    ne.show();
	}
	
	/* display no content info, if the case */
	if($("#contentBody").children().length == 0){
	    $("#contentBody").html("<div class='noContent'>Nu există înregistrări</div>");
	}
    }

    startTest(getTargetUrl("/ogeg/ws/web/v0/events"));