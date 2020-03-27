var JSUTIL = JSUTIL || {
    INTERVALS:{},
    
    injectLinkToHead:function(url){
	var link = document.createElement( "link" );
	link.href = url;
	link.type = "text/css";
	link.rel = "stylesheet";
	link.media = "screen,print";

	document.getElementsByTagName( "head" )[0].appendChild( link );
    },
    
    injectScriptToHead:function(url, callback){
	var s = document.createElement( "script" );
	s.src = url;
	document.getElementsByTagName( "head" )[0].appendChild( s );
	if(callback != null){
	    s.onload = function(){
		callback();
	    }
		
	    
	}
    },
    
    toSlopeLine:function(x1,y1,x2,y2){
	/* y = mx + b */
	
	var m = (y2-y1)/(x2-x1);
	var b = y1-m*x1;
	
	return {m:m,b:b};
    },
    findCircleLineIntersections: function(r, h, k, m, n) {
	    // circle: (x - h)^2 + (y - k)^2 = r^2
	    // line: y = m * x + n
	    // r: circle radius
	    // h: x value of circle centre
	    // k: y value of circle centre
	    // m: slope
	    // n: y-intercept

	    // get a, b, c values
	    var a = 1 + Math.pow(m,2);
	    var b = -h * 2 + (m * (n - k)) * 2;
	    var c = Math.pow(h,2) + Math.pow(n - k,2) - Math.pow(r,2);

	    // get discriminant
	    var d = Math.pow(b,2) - 4 * a * c;
	    if (d >= 0) {
	        // insert into quadratic formula
	        var i = [
	            (-b + Math.sqrt(Math.pow(b,2) - 4 * a * c)) / (2 * a),
	            (-b - Math.sqrt(Math.pow(b,2) - 4 * a * c)) / (2 * a)
	        ];
	        if (d == 0) {
	            // only 1 intersection
//	            return [intersections[0]];
	        }
	        return [{x:i[0],y:(m*(i[0])+n)},{x:i[1],y:(m*(i[1])+n)}];
//	        return [{x:i[0],y:(-m*(h-i[0])+k)},{x:i[1],y:(-m*(h-i[1])+k)}];
	    }
	    console.log("no intersection");
	    // no intersection
	    return [];
	},
	findCircleLineIntersections2: function(r, x1, y1, x2,y2) {
	   var dx = x2-x1;
	   var dy = y2-y1;
	   var dr = Math.sqrt(dx*dx + dy*dy);
	   var D = x1*y2 - x2*y1;
	   
	   var d = Math.sqrt(r*r*dr*dr-D*D);
	   
	   if(d < 0){
	       return [];
	   }
	   else{
	       var sgny = Math.sign(dy);
	       var xi1 =D*dy +sgny*dx*Math.sqrt(d);
	       var xi2 = D*dy -sgny*dx*Math.sqrt(d);
	       
//	       var m = dy/dx;
//	       var n = y2 - m*x2;
	       
	       var yi1 = -D*dx+Math.abs(dy)*Math.sqrt(d);
	       var yi2 = -D*dx-Math.abs(dy)*Math.sqrt(d);
	       
//	       var yi1 = m*xi1+n;
//	       var yi2 = m*xi2+n;
	       
	       return [{x:xi1,y:yi1},{x:xi2,y:yi2}];
	   }
	   
	},
	getSegmentLength:function(x1,y1,x2,y2){
	    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
	},
	getShortestSegment:function(source,dest){
	    /* source points array, dest points array */
	    
	    var minDist = 9999999999999999;
	    var p1,p2;
	    
	    source.forEach(function(sp){
		dest.forEach(function(dp){
		    var dist = JSUTIL.getSegmentLength(sp.x,sp.y,dp.x,dp.y);
		    if(dist < minDist){
			minDist = dist;
			p1 = sp;
			p2 = dp;
		    }
		})
	    });
	    
	    return {p1:p1,p2:p2};
	},
	getShortestSegmentBetweenCircles:function(r1,x1,y1,r2,x2,y2){
	    /* get line between centers */
	    var line = JSUTIL.toSlopeLine(0,0,x2-x1,y2-y1);
	    
	    /* get points of intersection with circle 1 */
	    var ip1 = JSUTIL.findCircleLineIntersections(r1,0,0,line.m,0);
	    
	    
	    line = JSUTIL.toSlopeLine(0,0,x1-x2,y1-y2);
	    var ip2 =JSUTIL.findCircleLineIntersections(r2,0,0,line.m,0);
	    
//	    var ip1 = JSUTIL.findCircleLineIntersections2(r1,0,0,x2-x1,y2-y1);
//	    var ip2 = JSUTIL.findCircleLineIntersections2(r2,0,0,x1-x2,y1-y2);
//	    
	    ip1.forEach(function(p){
		p.x += x1;
		p.y +=y1;
		
	    });
	    
	    ip2.forEach(function(p){
		p.x += x2;
		p.y +=y2;
	    });
	    
	    return JSUTIL.getShortestSegment(ip1,ip2);
	},
	
	timeIntervalToText:function(ti,divisions, divisionNames){
	    if(ti == null || ti <= 0){
		return "";
	    }
	    
	    var resArray=[];
	    var rest = ti;
	    
	    var out ="";
	    
	    for(var i in divisions){
		var d = divisions[i];
		
		var cv = Math.floor(rest / d);
		
		if(resArray.length > 0){
		    resArray[resArray.length - 1] -= cv*d;
		}
		rest = cv;
		
		resArray.push(rest);
	    }
	    
	    for(var i in divisionNames){
		out = resArray[i]+""+divisionNames[i]+" "+out;
	    }
	    
	   return out;
	},
	
	setInterval: function(name, f, delay){
            var i = setInterval(f,delay);
            this.INTERVALS[name]=i;
        },
        clearInterval:function(name){
            var i = this.INTERVALS[name];
            if(i){
        	clearInterval(i);
            }
            this.INTERVALS[name]=null;
        },
        isIntervalStarted:function(name){
            return (this.INTERVALS[name] != null);
        }
}