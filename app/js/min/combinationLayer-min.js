function combinationLayer(){var t=this;this.svglayer="",this.routes_geo=[],this.active=!0,this.scaleFactor=0,this.setActive=function(t){null===t?this.active=!this.active:this.active=t,this.svglayer.classed("disabled",!this.active)},this.init=function(e,a){function i(e,i,s){function l(e){t.svglayer.selectAll("g[data-id='"+e.id+"']").selectAll("g").append("path").attr("data-id",e.id).attr("data-traveltime",e.travelTime).attr("class","route").attr("d",e.path),t.routes_geo[e.id]=e.geometry.coordinates}function r(t){var e={init:function(){return this.id=s,this.geometry=t.geometry,this.travelTime=t.properties.travelTime,this.path=lineFunction(this.geometry.coordinates),this}}.init(),i={};i.id=s,i.route=e,routesJSON.routes.push(i),routesJSON.routes.length===a.features.length,l(e)}routesJSON.routes.length>0?(console.log("ROUTING CACHED"),l(routesArray[s])):$.ajax({dataType:"json",url:app.config.apiBase+"/route/"+e+"/"+i,success:r,error:function(t){alert(t)}})}this.svglayer=e.append("g").attr("id","combinationlayer"),this.setActive(!1),t.svglayer.selectAll("g").data(a.features).enter().append("g").attr("class","smallmultiple").attr("data-id",function(t){return t.properties.osm_id}).each(function(){var t=d3.select(this);t.append("text").text(function(t){return t.properties.name}).attr("class","title").attr("y","30"),app.config.layoutdebug===!0&&t.append("rect").attr("class","layoutdebug")}).append("g").attr("class","sm_vis").each(function(t){var e=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];i(app.config.coordHomeBase,e,t.properties.osm_id)})},this.update=function(t){this.calc(),updateSettlementPointLayer(t),this.render(t)},this.calc=function(){if("smallmultiples"===app.view){var e=0,a=0,i=0,s=0;this.svglayer.selectAll(".smallmultiple").selectAll("g").each(function(){var t=d3.select(this).node().getBBox();t.height>s&&(s=t.height),t.width>i&&(i=t.width)});var l=(app.layout.heightperelement-20)/s,r=app.layout.widthperelement/i;t.scaleFactor=l,r<t.scaleFactor&&(t.scaleFactor=r),this.svglayer.selectAll(".smallmultiple").each(function(i){var s=d3.select(this),l=i.geometry.coordinates,r=app.layout.offsetLeft+e*(app.layout.gapX+app.layout.widthperelement),o=app.layout.offsetTop+a*(app.layout.gapY+app.layout.heightperelement);e++,e===app.layout.cols&&(e=0),a++,a===app.layout.rows&&(a=0),s.attr("data-transformX",r).attr("data-transformY",o),s.selectAll("g").each(function(){var e=d3.select(this),a=e.node().getBBox(),i=-a.x*t.scaleFactor,n=(-a.y-a.height+(app.layout.heightperelement-20)/t.scaleFactor)*t.scaleFactor;e.attr("data-transformX",i).attr("data-transformY",n);var c=parseFloat(project(l).x*t.scaleFactor)+i+r,p=parseFloat(project(l).y*t.scaleFactor)+n+o;t.active&&(app.villagePositions[s.attr("data-id")]={},app.villagePositions[s.attr("data-id")].x=c,app.villagePositions[s.attr("data-id")].y=p)})})}else t.active&&(app.villagePositions=app.villagePositionsMap.slice())},this.render=function(e){"smallmultiples"===app.view?this.svglayer.selectAll(".smallmultiple").each(function(){var a=d3.select(this);a.transition().duration(e).style("opacity",1).attr("transform",function(){return"translate("+d3.select(this).attr("data-transformX")+","+d3.select(this).attr("data-transformY")+")"}),app.config.layoutdebug===!0&&a.selectAll(".layoutdebug").attr("width",app.layout.widthperelement).attr("height",app.layout.heightperelement),a.selectAll("text").attr("x",0).attr("y",app.layout.heightperelement).transition().duration(e).style("opacity",1),a.selectAll("g").transition().duration(e).style("opacity",1).attr("transform",function(){return"translate("+d3.select(this).attr("data-transformX")+","+d3.select(this).attr("data-transformY")+") scale("+t.scaleFactor+")"})}):this.svglayer.selectAll(".smallmultiple").each(function(){var a=d3.select(this);a.transition().duration(e).style("opacity",1).attr("transform",""),a.selectAll("text").transition().duration(e).style("opacity",0),a.selectAll("g").transition().duration(e).attr("transform",""),a.selectAll("g").selectAll("path").each(function(){var e=d3.select(this);e.attr("d",lineFunction(t.routes_geo[e.attr("data-id")]))})})}}