var JSUTIL=JSUTIL||{INTERVALS:{},injectLinkToHead:function(url){var link=document.createElement("link");link.href=url,link.type="text/css",link.rel="stylesheet",link.media="screen,print",document.getElementsByTagName("head")[0].appendChild(link)},injectScriptToHead:function(url,callback){var s=document.createElement("script");s.src=url,document.getElementsByTagName("head")[0].appendChild(s),null!=callback&&(s.onload=function(){callback()})},toSlopeLine:function(x1,y1,x2,y2){var m=(y2-y1)/(x2-x1);return{m:m,b:y1-m*x1}},findCircleLineIntersections:function(r,h,k,m,n){var a=1+Math.pow(m,2),b=2*-h+m*(n-k)*2,c=Math.pow(h,2)+Math.pow(n-k,2)-Math.pow(r,2),d=Math.pow(b,2)-4*a*c;if(d>=0){var i=[(-b+Math.sqrt(Math.pow(b,2)-4*a*c))/(2*a),(-b-Math.sqrt(Math.pow(b,2)-4*a*c))/(2*a)];return[{x:i[0],y:m*i[0]+n},{x:i[1],y:m*i[1]+n}]}return console.log("no intersection"),[]},findCircleLineIntersections2:function(r,x1,y1,x2,y2){var dx=x2-x1,dy=y2-y1,dr=Math.sqrt(dx*dx+dy*dy),D=x1*y2-x2*y1,d=Math.sqrt(r*r*dr*dr-D*D);if(d<0)return[];var sgny=Math.sign(dy),xi1=D*dy+sgny*dx*Math.sqrt(d),xi2=D*dy-sgny*dx*Math.sqrt(d);return[{x:xi1,y:-D*dx+Math.abs(dy)*Math.sqrt(d)},{x:xi2,y:-D*dx-Math.abs(dy)*Math.sqrt(d)}]},getSegmentLength:function(x1,y1,x2,y2){return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))},getShortestSegment:function(source,dest){var p1,p2,minDist=1e16;return source.forEach((function(sp){dest.forEach((function(dp){var dist=JSUTIL.getSegmentLength(sp.x,sp.y,dp.x,dp.y);dist<minDist&&(minDist=dist,p1=sp,p2=dp)}))})),{p1:p1,p2:p2}},getShortestSegmentBetweenCircles:function(r1,x1,y1,r2,x2,y2){var line=JSUTIL.toSlopeLine(0,0,x2-x1,y2-y1),ip1=JSUTIL.findCircleLineIntersections(r1,0,0,line.m,0);line=JSUTIL.toSlopeLine(0,0,x1-x2,y1-y2);var ip2=JSUTIL.findCircleLineIntersections(r2,0,0,line.m,0);return ip1.forEach((function(p){p.x+=x1,p.y+=y1})),ip2.forEach((function(p){p.x+=x2,p.y+=y2})),JSUTIL.getShortestSegment(ip1,ip2)},timeIntervalToText:function(ti,divisions,divisionNames){if(null==ti||ti<=0)return"";var resArray=[],rest=ti,out="";for(var i in divisions){var d=divisions[i],cv=Math.floor(rest/d);resArray.length>0&&(resArray[resArray.length-1]-=cv*d),rest=cv,resArray.push(rest)}for(var i in divisionNames)out=resArray[i]+""+divisionNames[i]+" "+out;return out},setInterval:function(name,f,delay){var i=setInterval(f,delay);this.INTERVALS[name]=i},clearInterval:function(name){var i=this.INTERVALS[name];i&&clearInterval(i),this.INTERVALS[name]=null},isIntervalStarted:function(name){return null!=this.INTERVALS[name]},parseFragment:function(fragment){}};class AppController{constructor(){this.SECTION_PARAM="s",this.urlParams=this.buildParamsFromFragment(window.location.hash)}buildParamsFromFragment(paramsString){if(paramsString){if("#"===paramsString.charAt(0)&&(paramsString=paramsString.substring(1)),paramsString.includes("="))return new URLSearchParams(paramsString);var urlParams=new URLSearchParams;return urlParams.set(this.SECTION_PARAM,paramsString),urlParams}return new URLSearchParams}getSection(){return this.urlParams.get(this.SECTION_PARAM)}setSection(section,setHash){this.urlParams=new URLSearchParams,this.urlParams.set(this.SECTION_PARAM,section),setHash&&this.setParamsToURL()}setParamsToURL(){window.location.hash="#"+this.urlParams.toString()}getParam(paramName){return this.urlParams.get(paramName)}clearFilterValues(setHash){var section=this.getSection();this.setSection(section,setHash)}setFilterParams(filterValues,setHash){this.clearFilterValues(),filterValues&&filterValues.forEach((item=>{var fv=item.fieldValue;this.urlParams.set(fv.id,fv.value)})),setHash&&this.setParamsToURL()}getFiltersFromParams(valuesMap){var values=[];return this.urlParams.forEach(((v,k)=>{k!=this.SECTION_PARAM&&(values.push({fieldValue:{id:k,value:v}}),null!=valuesMap&&(valuesMap[k]=v))})),values.length>0?values:null}}