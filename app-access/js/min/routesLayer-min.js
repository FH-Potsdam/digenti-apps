function routesLayer(){var t=this;this.svglayer="",this.routes_geo=[],this.scaleFactor=0,this.lastView="",this.init=function(e,a){function r(e,r,s){function o(e){for(var a=generateUniqueID(),r=0;r<e.properties.id.length;r++)t.svglayer.selectAll("g[data-id='"+e.properties.id[r]+"']").append("path").attr("data-id",a).attr("class","route").attr("data-stroke-width",.4*e.properties.importancescore+1).attr("stroke-width",.4*e.properties.importancescore+1).attr("d",lineFunction(e.geometry.coordinates)),t.routes_geo[a]=e.geometry.coordinates}function i(t){var e=t instanceof Array,r=e?t[0]:t;r.properties.id=s,routesGeoJSON.features.push(r);var i={init:function(){return this.id=s,this.geometry=r.geometry,this.travelTime=r.properties.travelTime,this.distance=r.properties.distance,this.path=lineFunction(this.geometry.coordinates),this}}.init(),l={};l.id=s,l.route=i,e&&(l.route_sliced=t[1]),routesJSON.routes.push(l),routesJSON.routes.length===a.features.length&&$.ajax({method:"POST",url:app.config.apiBase+"/geoprocessing/routeparts",data:JSON.stringify(jsonToObjectRouteOnly(routesJSON.routes)),contentType:"application/json; charset=utf-8",dataType:"json",success:function(t){for(var e=0;e<t.data.features.length;e++)o(t.data.features[e])},error:function(t){alert(t)}})}routesJSON.routes.length>0?console.log("ROUTING CACHED"):$.ajax({dataType:"json",url:app.config.apiBase+"/route/"+e+"/"+r+"/?profile=true",success:i,error:function(t){alert(t)}})}this.svglayer=e.append("g").attr("id","routesfromvalledupar"),t.svglayer.selectAll("g").data(a.features).enter().append("g").attr("class","smallmultiple sm_vis").attr("data-id",function(t){return t.properties.osm_id}).each(function(t){var e=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];r(app.config.coordHomeBase,e,t.properties.osm_id)})},this.update=function(t){this.calc(),this.render(t)},this.calc=function(){if("smallmultiples"===app.view){var e=0,a=0,r=0,s=0;this.svglayer.selectAll(".smallmultiple").each(function(){var t=d3.select(this).node().getBBox();t.height>s&&(s=t.height),t.width>r&&(r=t.width)});var o=(app.layout.heightperelement-20)/s,i=app.layout.widthperelement/r;t.scaleFactor=o,i<t.scaleFactor&&(t.scaleFactor=i),this.svglayer.selectAll(".smallmultiple").each(function(r){var s=d3.select(this),o=r.geometry.coordinates,i=app.layout.offsetLeft+e*(app.layout.gapX+app.layout.widthperelement),l=app.layout.offsetTop+a*(app.layout.gapY+app.layout.heightperelement);e++,e===app.layout.cols&&(e=0),a++,a===app.layout.rows&&(a=0),s.attr("data-transformX",i).attr("data-transformY",l),smpos[s.attr("data-id")]={},smpos[s.attr("data-id")].x=i,smpos[s.attr("data-id")].y=l,console.log(smpos[s.attr("data-id")]);var n=s.node().getBBox(),p=-n.x*t.scaleFactor,c=(-n.y-n.height+(app.layout.heightperelement-20)/t.scaleFactor)*t.scaleFactor;s.attr("data-transformX",p).attr("data-transformY",c);var u=parseFloat(project(o).x*t.scaleFactor)+p+i,d=parseFloat(project(o).y*t.scaleFactor)+c+l})}},this.render=function(e){"smallmultiples"===app.view?this.svglayer.selectAll(".smallmultiple").each(function(){var a=d3.select(this),r=a.attr("data-id");app.config.layoutdebug===!0&&a.selectAll(".layoutdebug").attr("width",app.layout.widthperelement).attr("height",app.layout.heightperelement),a.transition().duration(e).style("opacity",0).attr("transform",function(){return"translate("+smpos[r].x+","+smpos[r].y+") scale("+t.scaleFactor+")"})}):this.svglayer.selectAll(".smallmultiple").each(function(){var a=d3.select(this);t.lastView===app.view&&""!==t.lastView||a.transition().duration(e).style("opacity",1).attr("transform",""),a.selectAll("path").each(function(){var e=d3.select(this);e.attr("d",lineFunction(t.routes_geo[e.attr("data-id")]))})}),t.lastView=app.view}}