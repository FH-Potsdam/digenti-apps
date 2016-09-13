function missingInfrastructureLayer(){function t(){for(var t=0;t<places_aoi.features.length;t++)e(places_aoi.features[t])}function e(t){function e(e){var r=e.properties.waypoints[1].mappedPosition,i=e.properties.waypoints[1].distance;if(s=i<a.distance_threshold?{touches_street:!0,distance_to_street:i,nearest_point:r}:{touches_street:!1,distance_to_street:i,nearest_point:r},t.properties.connections=s,a.places_aoi_street_distance.features.push(t),a.places_aoi_street_distance.features.length===places_aoi.features.length){var o=a.places_aoi_street_distance.features,n=o.map(function(t,e){return{index:e,value:t}});n.sort(function(t,e){return e.value.properties.connections.distance_to_street-t.value.properties.connections.distance_to_street});for(var p=0;p<n.length;p++)a.places_aoi_street_distance.features[n[p].index].properties.connections.distance_order=p;a.places_aoi_street_distance.features.sort(function(t,e){return d3.ascending(t.properties.name,e.properties.name)}),a.svglayer.selectAll(".village-group").each(function(t){var e=d3.select(this);app.config.layoutdebug===!0&&e.append("rect").attr("class","layoutdebug");var s=0;t.properties.connections.distance_to_street>a.distance_threshold&&(e.append("line").attr("class","missing"),e.append("circle").attr({r:3}).attr("class","nearest-road"),s=t.properties.connections.distance_to_street);var r=e.append("text").attr("y","0");r.append("tspan").text(t.properties.name).attr("class","title").attr("x",0).attr("dy","0"),r.append("tspan").text(Math.round(s)+" m to street").attr("x",0).attr("dy","1em")}),a.update(0)}}var s,r=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];$.ajax({dataType:"json",url:app.config.apiBase+"/route/"+app.config.coordHomeBase+"/"+r,success:e,error:function(t){console.log(t)}})}var a=this;this.places_aoi_street_distance={type:"FeatureCollection",crs:{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}},features:[]},this.active=!0,this.factor=0,this.positionSmallVisY=app.layout.heightperelement-40,this.distance_threshold=100,this.setActive=function(t){null===t?this.active=!this.active:this.active=t,this.svglayer.classed("disabled",!this.active)},this.init=function(e,a){this.svglayer=e.append("g").attr("id","missinginfrastructure"),this.setActive(!1),this.villages=this.svglayer.selectAll("g").data(a.features).enter().append("g").attr("class","village-group").attr("data-id",function(t){return t.properties.osm_id}),t()},this.calc=function(){if("smallmultiples"===app.view){for(var t=0,e=0,s=[],r=0;r<a.places_aoi_street_distance.features.length;r++)s.push(a.places_aoi_street_distance.features[r].properties.connections.distance_to_street);a.faktor=.8*app.layout.widthperelement/(2*Math.max.apply(null,s)),a.svglayer.selectAll(".village-group").each(function(s){var r=d3.select(this);if("distance"===app.orderby){var i=s.properties.connections.distance_order;e=Math.floor(i/app.layout.cols),t=Math.round(app.layout.cols*(i/app.layout.cols-e))}var o=app.layout.offsetLeft+t*(app.layout.gapX+app.layout.widthperelement),n=app.layout.offsetTop+e*(app.layout.gapY+app.layout.heightperelement);r.attr("data-transformX",o).attr("data-transformY",n);var p=8;s.properties.connections.distance_to_street>0&&(p=2*a.faktor*s.properties.connections.distance_to_street),a.active&&(app.villagePositions[r.attr("data-id")]={},app.villagePositions[r.attr("data-id")].x=o+p,app.villagePositions[r.attr("data-id")].y=n+a.positionSmallVisY),"size"===app.orderby&&(t++,t===app.layout.cols&&(t=0),e++,e===app.layout.rows&&(e=0))})}else a.active&&(app.villagePositions=app.villagePositionsMap.slice())},this.update=function(t){this.calc(),updateSettlementPointLayer(t),this.render(t)},this.render=function(t){"smallmultiples"===app.view?a.svglayer.selectAll(".village-group").each(function(e){var s=d3.select(this);app.config.layoutdebug===!0&&s.selectAll(".layoutdebug").attr("width",app.layout.widthperelement).attr("height",app.layout.heightperelement),s.transition().duration(t).style("opacity",1).attr("transform","translate("+s.attr("data-transformX")+","+s.attr("data-transformY")+")"),e.properties.connections.distance_to_street>a.distance_threshold&&(s.select(".nearest-road").transition().duration(t).style("opacity",1).attr("cy",a.positionSmallVisY).attr("cx",0),s.select("line").transition().duration(t).attr("x1",0).attr("y1",a.positionSmallVisY).attr("x2",2*a.faktor*e.properties.connections.distance_to_street).attr("y2",a.positionSmallVisY)),s.selectAll("text").attr("x",0).attr("y",app.layout.heightperelement).transition().duration(app.config.transitionTime).style("opacity",1)}):a.svglayer.selectAll(".village-group").each(function(e){var s=d3.select(this),r=project(e.geometry.coordinates).x,i=project(e.geometry.coordinates).y,o=project(e.properties.connections.nearest_point).x-r,n=project(e.properties.connections.nearest_point).y-i;s.transition().duration(t).style("opacity",1).attr("transform","translate("+r+","+i+")"),e.properties.connections.distance_to_street>a.distance_threshold&&(s.select("line").style("opacity",.5).transition().duration(t).attr("x1",o).attr("y1",n).attr("x2",0).attr("y2",0),s.select(".nearest-road").transition().duration(t).style("opacity",1).attr("cx",o).attr("cy",n)),s.selectAll("text").transition().duration(t).style("opacity",0)})}}