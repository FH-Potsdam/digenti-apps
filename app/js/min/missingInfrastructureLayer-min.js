function missingInfrastructureLayer(t){function e(){for(var t=0;t<places_aoi.features.length;t++)a(places_aoi.features[t])}function a(t){function e(e){var o=e.properties.waypoints[1].mappedPosition,s=e.properties.waypoints[1].distance;if(a=200>s?{touches_street:!0,distance_to_street:s,nearest_point:o}:{touches_street:!1,distance_to_street:s,nearest_point:o},t.properties.connections=a,r.places_aoi_street_distance.features.push(t),r.places_aoi_street_distance.features.length===places_aoi.features.length){var n=r.places_aoi_street_distance.features,i=n.map(function(t,e){return{index:e,value:t}});i.sort(function(t,e){return e.value.properties.connections.distance_to_street-t.value.properties.connections.distance_to_street});for(var c=0;c<i.length;c++)r.places_aoi_street_distance.features[i[c].index].properties.connections.distance_order=c;activateButtons(),r.places_aoi_street_distance.features.sort(function(t,e){return d3.ascending(t.properties.name,e.properties.name)}),r.villages.data(r.places_aoi_street_distance.features).attr("data-distance",function(t){return t.properties.connections.distance_to_street}).attr("data-touches",function(t){return t.properties.connections.touches_street}).enter(),r.svglayer.selectAll(".village-group").each(function(t){var e=d3.select(this);e.append("rect").attr("class","layoutdebug"),e.append("line").attr("class","missing"),e.append("circle").attr({r:3}).attr("class","nearest-road");var a=e.append("text").attr("y","0");a.append("tspan").text(t.properties.name).attr("class","title").attr("x",0).attr("dy","0"),a.append("tspan").text(Math.round(t.properties.connections.distance_to_street)+" m to street").attr("x",0).attr("dy","-1em")}),update(0)}}var a,o={type:"Feature",properties:{"marker-color":"#f00"},geometry:{type:"Point",coordinates:t.geometry.coordinates}},s=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];$.ajax({dataType:"json",url:"http://localhost:61002/api/route/"+coord_valledupar+"/"+s,success:e,error:function(t){alert(t)}})}var r=this;this.places_aoi_street_distance={type:"FeatureCollection",crs:{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}},features:[]},this.bcr=[],this.setActive=function(t){this.active=t,this.svglayer.transition().duration(500).style("opacity",function(){return t?1:0})},this.init=function(t,a){this.svglayer=t.append("g").attr("class","villages"),this.villages=this.svglayer.selectAll("g").data(a.features).enter().append("g").attr("class","village-group").append("circle").attr({r:config.circleRadius}).attr("class","village").attr("data-id",function(t){return t.properties.osm_id}).on("click",function(t){d3.select(this).classed("selected",!0);var e=d3.select(this).attr("data-id");selectSettlement(t.properties.osm_id)}),this.setActive(!1),e()},this.update=function(t){if("smallmultiples"===config.view){for(var e=0,a=0,o=(config.layout.w-config.layout.offsetLeft-config.layout.offsetRight-(config.layout.cols-1)*config.layout.gapX)/config.layout.cols,s=(config.layout.h-config.layout.offsetTop-config.layout.offsetBottom-(config.layout.rows-1)*config.layout.gapY)/config.layout.rows,n=s-40,i=[],c=0;c<r.places_aoi_street_distance.features.length;c++)i.push(r.places_aoi_street_distance.features[c].properties.connections.distance_to_street);var l=.8*config.layout.gap_hor/(2*Math.max.apply(null,i));r.svglayer.selectAll(".village-group").each(function(i){var c=d3.select(this);c.transition().duration(t).style("opacity",1).attr("transform",function(){if("distance"==config.orderby){var t=i.properties.connections.distance_order;a=Math.floor(t/config.layout.cols),e=Math.round(config.layout.cols*(t/config.layout.cols-a))}var r=config.layout.offsetLeft+(e-1)*config.layout.gapX+e*o,n=config.layout.offsetTop+(a-1)*config.layout.gapY+a*s;return"translate("+r+","+n+")"}),layoutdebug===!0?c.selectAll(".layoutdebug").attr("fill","rgba(255, 0, 255, 0.3)").attr("width",o).attr("height",s):c.selectAll(".layoutdebug").attr("fill","none").attr("width",o).attr("height",s),c.select(".village").attr("cy",n).attr("cx",function(){var t=8;return i.properties.connections.distance_to_street>0&&(t=2*l*i.properties.connections.distance_to_street),t}).each(function(){r.bcr[d3.select(this).attr("data-id")]=d3.select(this).node().getBoundingClientRect()}),c.select(".nearest-road").transition().duration(t).style("opacity",1).attr("cy",n).attr("cx",function(){var t=8;return i.properties.connections.distance_to_street>0&&(t=0),t}),c.select("line").transition().duration(t).attr("x1",0).attr("y1",n).attr("x2",2*l*i.properties.connections.distance_to_street).attr("y2",n),c.selectAll("text").attr("x",0).attr("y",s).transition().duration(500).style("opacity",1),setMapOpacity(.08),"size"==config.orderby&&(e++,e===config.layout.cols&&(e=0),a++,a===config.layout.rows&&(a=0))})}else"map-distances"===config.view?r.svglayer.selectAll(".village-group").each(function(e){var a=d3.select(this),o=project(e.geometry.coordinates).x,s=project(e.geometry.coordinates).y,n=project(e.properties.connections.nearest_point).x-o,i=project(e.properties.connections.nearest_point).y-s;a.transition().duration(t).style("opacity",1).attr("transform",function(){return"translate("+o+","+s+")"}),a.select(".village").attr("cy",0).attr("cx",0).each(function(){r.bcr[d3.select(this).attr("data-id")]=d3.select(this).node().getBoundingClientRect()}),a.select(".nearest-road").transition().duration(t).style("opacity",1).attr("cx",n).attr("cy",i),a.select("line").style("opacity",.5).transition().duration(t).attr("x1",0).attr("y1",0).attr("x2",n).attr("y2",i),a.selectAll("text").transition().duration(t).style("opacity",0),setMapOpacity(1)}):r.svglayer.selectAll(".village-group").each(function(e){var a=d3.select(this);a.transition().duration(t).style("opacity",1).attr("transform",function(){return"translate("+project(e.geometry.coordinates).x+","+project(e.geometry.coordinates).y+")"}),a.select(".village").attr("cy",0).attr("cx",0).each(function(){r.bcr[d3.select(this).attr("data-id")]=d3.select(this).node().getBoundingClientRect()}),a.select(".nearest-road").transition().duration(t).style("opacity",0),a.select("line").transition().duration(t).attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",0),a.selectAll("text").transition().duration(t).style("opacity",0),setMapOpacity(1)})}}