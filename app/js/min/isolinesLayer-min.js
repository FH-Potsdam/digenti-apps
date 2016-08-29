function isolinesLayer(t){function e(t,e){i(t,e)}function i(t,e){var i=t.geometry.coordinates,s=i[1]+","+i[0],a=30,r="http://localhost:61002/api/isoline/"+s+"/"+a,n=function(s){this.isolinesQueried++;var a=s,r={type:"Feature",properties:{"marker-color":"#f00"},geometry:{type:"Point",coordinates:i}},n=turf.buffer(a,2e3,"meters"),l=turf.inside(r,n.features[0]);if(l){a.properties.osm_id=t.properties.osm_id,a.properties.name=t.properties.name,o.isolinesGeoJSON.features.push(a);var c=o.svglayer.select('g[data-id="'+e+'"]').select(".isoline-group-vis"),u=c.append("path").data([a]).attr("class","isoline").attr("data-id",e)}this.isolinesQueried===places_aoi.features.length&&(this.update(500),console.log("FERTIG"))};$.ajax({dataType:"json",url:r,success:n,error:function(t){alert(t)}})}var o=this;this.circleRadius=5,this.isolineColor="#3dc8e7",this.isolineOpacity=.35,this.isolinesQueried=0,this.bcr=[],this.isolinesGeoJSON={type:"FeatureCollection",crs:{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}},features:[]},this.setActive=function(t){this.active=t,this.svglayer.transition().duration(500).style("opacity",function(){return t?1:0})},this.init=function(t,e){this.svglayer=t.append("g").attr("class","isolines"),this.setActive(!1),this.svglayer.selectAll("circle").data(e.features).enter().append("g").attr("data-id",function(t){return t.properties.osm_id}).attr("class","isoline-group").each(function(t){var e=d3.select(this);e.append("rect").attr("class","layoutdebug")}).append("g").attr("class","isoline-group-vis").each(function(t){var e=d3.select(this);e.append("circle").attr({r:config.circleRadius}).attr("class","village").attr("data-id",function(t){return t.properties.osm_id}).each(function(t){i(t,t.properties.osm_id)})})},this.update=function(t){var e=d3.geo.transform({point:projectPoint}),i=d3.geo.path().projection(e);if(isDefined(this.svglayer))if("smallmultiples"===config.view){var s=0,a=0,r=0,n=0;this.svglayer.selectAll(".isoline-group-vis").each(function(t,e){var i=d3.select(this),o=i.node().getBBox().width,s=i.node().getBBox().height;s>n&&(n=s),o>r&&(r=o)});var l=(config.layout.w-config.layout.offsetLeft-config.layout.offsetRight-(config.layout.cols-1)*config.layout.gapX)/config.layout.cols,c=(config.layout.h-config.layout.offsetTop-config.layout.offsetBottom-(config.layout.rows-1)*config.layout.gapY)/config.layout.rows,u=c/n,f=l/r,d=u;d>f&&(d=f),this.svglayer.selectAll(".isoline-group").each(function(e,i){var o=d3.select(this);layoutdebug===!0?o.selectAll(".layoutdebug").attr("fill","rgba(255, 0, 255, 0.3)").attr("width",l).attr("height",c):o.selectAll(".layoutdebug").attr("fill","none").attr("width",l).attr("height",c),o.transition().duration(t).style("opacity",1).attr("transform",function(){var t=config.layout.offsetLeft+(s-1)*config.layout.gapX+s*l,e=config.layout.offsetTop+(a-1)*config.layout.gapY+a*c;return s++,s===config.layout.cols&&(s=0),a++,a===config.layout.rows&&(a=0),"translate("+t+","+e+")"})}),this.svglayer.selectAll(".isoline-group-vis").each(function(e,i){var s=d3.select(this);s.transition().duration(t).style("opacity",1).attr("transform",function(){var t=d3.select(this).node().getBBox(),e=-t.x+l/d/2-t.width/2,i=-t.y+c/d/2-t.height/2;return"scale("+d+") translate("+e+","+i+")"}),s.selectAll("circle").transition().delay(t/6).duration(t).attr({r:config.circleRadius/d}).each(function(){o.bcr[d3.select(this).attr("data-id")]=d3.select(this).node().getBoundingClientRect()})}),this.svglayer.selectAll(".isoline").each(function(t,e){var o=d3.select(this);o.attr("d",i)})}else this.svglayer.selectAll(".isoline-group").each(function(e,i){var o=d3.select(this);o.transition().duration(t).style("opacity",1).attr("stroke-width",2).attr("transform",function(){return""})}),this.svglayer.selectAll(".isoline-group-vis").each(function(e,i){var o=d3.select(this);o.transition().duration(t).attr("transform",function(){return""})}),this.svglayer.selectAll("circle").each(function(){var e=d3.select(this);e.transition().duration(t).attr({r:config.circleRadius}).attr({cx:function(t){return project(t.geometry.coordinates).x},cy:function(t){return project(t.geometry.coordinates).y}})}),this.svglayer.selectAll(".isoline").each(function(t,e){var o=d3.select(this);o.attr("d",i)}),setMapOpacity(1)}}