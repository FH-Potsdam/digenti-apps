function missingInfrastructureLayer(){function t(){for(var t=0;t<places_aoi.features.length;t++)e(places_aoi.features[t])}function e(t){function e(e){var o=e.properties.waypoints[1].mappedPosition,i=e.properties.waypoints[1].distance;if(i<a.distance_threshold)r={touches_street:!0,distance_to_street:i,nearest_point:o};else{r={touches_street:!1,distance_to_street:i,nearest_point:o};var n=o[1]+","+o[0];$.ajax({dataType:"json",url:app.config.apiBase+"/profile/points/"+n+"/"+s,success:function(e){var a=t.properties.osm_id,r=e instanceof Array,s={};s.id=a,s.missing=e[0],r&&(s.missing_sliced=e[1]),routesJSON.missing.push(s)},error:function(t){console.log(t)}})}if(t.properties.connections=r,a.places_aoi_street_distance.features.push(t),a.places_aoi_street_distance.features.length===places_aoi.features.length){var p=a.places_aoi_street_distance.features,c=p.map(function(t,e){return{index:e,value:t}});c.sort(function(t,e){return e.value.properties.connections.distance_to_street-t.value.properties.connections.distance_to_street});for(var l=0;l<c.length;l++)a.places_aoi_street_distance.features[c[l].index].properties.connections.distance_order=l;a.places_aoi_street_distance.features.sort(function(t,e){return d3.ascending(t.properties.name,e.properties.name)}),a.svglayer.selectAll(".village-group").each(function(t){var e=d3.select(this);app.config.layoutdebug===!0&&e.append("rect").attr("class","layoutdebug");var r=0;t.properties.connections.distance_to_street>a.distance_threshold&&(e.append("line").attr("class","missing"),e.append("circle").attr({r:3}).attr("class","nearest-road"),r=t.properties.connections.distance_to_street);var s=d3.select("#label-layer > g[data-id='"+t.properties.osm_id+"']");s.select("text .desc").text(Math.round(r)+"m to next road")}),a.update(0)}}var r,s=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];$.ajax({dataType:"json",url:app.config.apiBase+"/route/"+app.config.coordHomeBase+"/"+s,success:e,error:function(t){console.log(t)}})}var a=this;this.places_aoi_street_distance={type:"FeatureCollection",crs:{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}},features:[]},this.missingProfileArray=[],this.factor=0,this.positionSmallVisY=.3*app.layout.heightperelement,this.distance_threshold=100,this.init=function(e,a){this.svglayer=e.append("g").attr("id","missinginfrastructure"),this.villages=this.svglayer.selectAll("g").data(a.features).enter().append("g").attr("class","village-group").attr("data-id",function(t){return t.properties.osm_id}),t()},this.calc=function(){if("smallmultiples"===app.view){for(var t=0,e=0,r=[],s=0;s<a.places_aoi_street_distance.features.length;s++)r.push(a.places_aoi_street_distance.features[s].properties.connections.distance_to_street);a.faktor=.8*app.layout.widthperelement/(2*Math.max.apply(null,r)),a.svglayer.selectAll(".village-group").each(function(r){var s=d3.select(this);if("distance"===app.orderby){var o=r.properties.connections.distance_order;e=Math.floor(o/app.layout.cols),t=Math.round(app.layout.cols*(o/app.layout.cols-e))}var i=app.layout.offsetLeft+t*(app.layout.gapX+app.layout.widthperelement),n=app.layout.offsetTop+e*(app.layout.gapY+app.layout.heightperelement);s.attr("data-transformX",i).attr("data-transformY",n);var p=0;r.properties.connections.distance_to_street>0&&(p=2*a.faktor*r.properties.connections.distance_to_street,s.attr("data-cx",p));var c=s.attr("data-id");app.villagePositions[c]={x:i,y:n+a.positionSmallVisY},"size"===app.orderby&&(t++,t===app.layout.cols&&(t=0),e++,e===app.layout.rows&&(e=0))})}},this.update=function(t){this.calc(),this.render(t)},this.render=function(t){"smallmultiples"===app.view?a.svglayer.selectAll(".village-group").each(function(e){var r=d3.select(this);app.config.layoutdebug===!0&&r.selectAll(".layoutdebug").attr("width",app.layout.widthperelement).attr("height",app.layout.heightperelement),r.transition().duration(t).attr("transform","translate("+r.attr("data-transformX")+","+r.attr("data-transformY")+")"),e.properties.connections.distance_to_street>a.distance_threshold&&(r.select(".nearest-road").transition().duration(t).attr("cy",a.positionSmallVisY).attr("cx",r.attr("data-cx")),r.select("line").transition().duration(t).attr("x1",r.attr("data-cx")).attr("y1",a.positionSmallVisY).attr("x2",0).attr("y2",a.positionSmallVisY))}):a.svglayer.selectAll(".village-group").each(function(e){var r=d3.select(this);if(void 0!==e.properties.connections){var s=project(e.geometry.coordinates).x,o=project(e.geometry.coordinates).y,i=project(e.properties.connections.nearest_point).x-s,n=project(e.properties.connections.nearest_point).y-o;r.transition().duration(t).attr("transform","translate("+s+","+o+")"),e.properties.connections.distance_to_street>a.distance_threshold&&(r.select("line").transition().duration(t).attr("x1",i).attr("y1",n).attr("x2",0).attr("y2",0),r.select(".nearest-road").transition().duration(t).attr("cx",i).attr("cy",n))}})}}