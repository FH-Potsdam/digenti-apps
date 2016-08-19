function routesLayer(t){var e=this;this.svglayer="",this.routes_geo=[],this.init=function(t,r){function a(t,r,a){function i(t){console.log(t)}function s(t){e.svglayer.selectAll("g[data-id='"+t.id+"']").selectAll("g").append("path").attr("data-id",t.id).attr("data-traveltime",t.travelTime).attr("class","route").attr("d",t.path).attr("stroke-width",2),e.routes_geo[t.id]=t.geometry}function n(t){var e={init:function(){return this.id=a,this.geometry=transformHEREgeometry(t.response.route[0].shape),this.travelTime=t.response.route[0].summary.travelTime,this.path=lineFunction(this.geometry),this}}.init(),r={};r.id=a,r.route=e,routesJSON.routes.push(r),s(e)}var l={mode:"fastest;car",representation:"display",routeattributes:"waypoints,summary,shape,legs",maneuverattributes:"direction,action",waypoint0:t,waypoint1:r,returnelevation:"true"};routesJSON.routes.length>0?(console.log("ROUTING CACHED"),s(routesArray[a])):(console.log("ROUTING VIA API"),router.calculateRoute(l,n,i))}this.svglayer=t.append("g").attr("class","smallmultiples"),e.svglayer.selectAll("g").data(r.features).enter().append("g").attr("class","smallmultiple").attr("data-id",function(t){return t.properties.osm_id}).each(function(t){var e=d3.select(this);e.append("text").text(function(t){return t.properties.name}).attr("text-anchor","middle").attr("class","title").attr("y","30")}).append("g").attr("class","sm_vis").append("circle").attr({r:8}).attr("class","village").each(function(t){var e=d3.select(this),r="10.471667,-73.25",i=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];a(r,i,t.properties.osm_id)})},this.update=function(t){if("smallmultiples"===config.view){var r=0,a=0,i=7,s=6,n=20,l=0,o=0;this.svglayer.selectAll(".smallmultiple").selectAll("g").each(function(){var t=d3.select(this).node().getBBox(),e=t.width,r=t.height;r>o&&(o=r),e>l&&(l=e)});var c=.8*w/s,u=h/i-n,d=.2*w,p=u/o,g=c/l,m=p;m>g&&(m=g),this.svglayer.selectAll(".smallmultiple").each(function(){var e=d3.select(this);e.transition().duration(t).style("opacity",1).attr("transform",function(){var t=d+r*c,e=a*(u+n);return r++,r===s&&(r=0),a++,a===i&&(a=0),"translate("+t+","+e+")"}),e.append("rect").attr("fill","none").attr("width",c).attr("height",u),e.selectAll("text").attr("x",c/2).attr("y",u).transition().duration(t).style("opacity",1),e.selectAll("g").transition().duration(t).style("opacity",1).attr("transform",function(){var t=d3.select(this).node().getBBox(),e=(c/m-(t.width+t.x))/2,r=(u/m-(t.width+t.y))/2;return"scale("+m+") translate("+e+","+r+")"}),e.selectAll("g").selectAll("path").transition().duration(t).attr("stroke-width",function(){return 2/m}),e.selectAll("g").selectAll("circle").transition().duration(t).attr({r:4/m})}),setMapOpacity(.08),disableMapInteraction()}else setMapOpacity(1),enableMapInteraction(),this.svglayer.selectAll(".smallmultiple").each(function(){var r=d3.select(this);r.transition().duration(t).style("opacity",1).attr("stroke-width",2).attr("transform",function(){return""}),r.selectAll("text").transition().duration(t).style("opacity",0),r.selectAll("g").transition().duration(t).attr("transform",function(){return""}),r.selectAll("g").selectAll("path").each(function(){var t=d3.select(this);t.attr("d",lineFunction(e.routes_geo[t.attr("data-id")]))}).transition().duration(t).attr("stroke-width",function(){return 2}),r.selectAll("g").selectAll("circle").attr({cx:function(t){return project(t.geometry.coordinates).x},cy:function(t){return project(t.geometry.coordinates).y}}).transition().duration(t).attr({r:8})})}}