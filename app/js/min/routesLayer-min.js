function routesLayer(){var t=this;this.svglayer="",this.routes_geo=[],this.active=!0,this.scaleFactor=0,this.lastView="",this.setActive=function(t){null===t?this.active=!this.active:this.active=t,this.svglayer.classed("disabled",!this.active)},this.init=function(e,a){function s(e,s,r){function i(e){for(var a=generateUniqueID(),s=0;s<e.properties.id.length;s++)t.svglayer.selectAll("g[data-id='"+e.properties.id[s]+"']").selectAll("g").append("path").attr("data-id",a).attr("class","route").attr("stroke-width",.15*e.properties.importancescore+1).attr("d",lineFunction(e.geometry.coordinates)),t.routes_geo[a]=e.geometry.coordinates}function l(t){var e={init:function(){return this.id=r,this.geometry=t.geometry,this.travelTime=t.properties.travelTime,this.path=lineFunction(this.geometry.coordinates),this}}.init(),s={};s.id=r,s.route=e,routesJSON.routes.push(s),routesJSON.routes.length===a.features.length&&$.ajax({method:"POST",url:app.config.apiBase+"/geoprocessing/routeparts",data:JSON.stringify(jsonToObject(routesJSON.routes)),contentType:"application/json; charset=utf-8",dataType:"json",success:function(t){for(var e=0;e<t.data.features.length;e++)i(t.data.features[e])},error:function(t){alert(t)}})}routesJSON.routes.length>0?console.log("ROUTING CACHED"):$.ajax({dataType:"json",url:app.config.apiBase+"/route/"+e+"/"+s,success:l,error:function(t){alert(t)}})}this.svglayer=e.append("g").attr("id","routesfromvalledupar"),this.setActive(!1),t.svglayer.selectAll("g").data(a.features).enter().append("g").attr("class","smallmultiple").attr("data-id",function(t){return t.properties.osm_id}).each(function(){var t=d3.select(this);t.append("text").text(function(t){return t.properties.name}).attr("class","title").attr("y","30"),app.config.layoutdebug===!0&&t.append("rect").attr("class","layoutdebug")}).append("g").attr("class","sm_vis").each(function(t){var e=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];s(app.config.coordHomeBase,e,t.properties.osm_id)})},this.update=function(t){this.calc(),this.render(t)},this.calc=function(){if("smallmultiples"===app.view){var e=0,a=0,s=0,r=0;this.svglayer.selectAll(".smallmultiple").selectAll("g").each(function(){var t=d3.select(this).node().getBBox();t.height>r&&(r=t.height),t.width>s&&(s=t.width)});var i=(app.layout.heightperelement-20)/r,l=app.layout.widthperelement/s;t.scaleFactor=i,l<t.scaleFactor&&(t.scaleFactor=l),this.svglayer.selectAll(".smallmultiple").each(function(s){var r=d3.select(this),i=s.geometry.coordinates,l=app.layout.offsetLeft+e*(app.layout.gapX+app.layout.widthperelement),o=app.layout.offsetTop+a*(app.layout.gapY+app.layout.heightperelement);e++,e===app.layout.cols&&(e=0),a++,a===app.layout.rows&&(a=0),r.attr("data-transformX",l).attr("data-transformY",o),r.selectAll("g").each(function(){var e=d3.select(this),a=e.node().getBBox(),s=-a.x*t.scaleFactor,n=(-a.y-a.height+(app.layout.heightperelement-20)/t.scaleFactor)*t.scaleFactor;e.attr("data-transformX",s).attr("data-transformY",n);var c=parseFloat(project(i).x*t.scaleFactor)+s+l,p=parseFloat(project(i).y*t.scaleFactor)+n+o;t.active&&(app.villagePositions[r.attr("data-id")]={},app.villagePositions[r.attr("data-id")].x=c,app.villagePositions[r.attr("data-id")].y=p)})})}else t.active&&(app.villagePositions=app.villagePositionsMap.slice())},this.render=function(e){"smallmultiples"===app.view?this.svglayer.selectAll(".smallmultiple").each(function(){var a=d3.select(this);a.transition().duration(e).style("opacity",1).attr("transform",function(){return"translate("+d3.select(this).attr("data-transformX")+","+d3.select(this).attr("data-transformY")+")"}),app.config.layoutdebug===!0&&a.selectAll(".layoutdebug").attr("width",app.layout.widthperelement).attr("height",app.layout.heightperelement),a.selectAll("text").attr("x",0).attr("y",app.layout.heightperelement).transition().duration(e).style("opacity",1),a.selectAll("g").transition().duration(e).style("opacity",1).attr("transform",function(){return"translate("+d3.select(this).attr("data-transformX")+","+d3.select(this).attr("data-transformY")+") scale("+t.scaleFactor+")"})}):this.svglayer.selectAll(".smallmultiple").each(function(){var a=d3.select(this);t.lastView!==app.view&&(a.transition().duration(e).style("opacity",1).attr("transform",""),a.selectAll("text").transition().duration(e).style("opacity",0),a.selectAll("g").transition().duration(e).attr("transform","")),a.selectAll("g").selectAll("path").each(function(){var e=d3.select(this);e.attr("d",lineFunction(t.routes_geo[e.attr("data-id")]))})}),t.lastView=app.view}}