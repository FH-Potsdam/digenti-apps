function mapDraw(e){function t(e,t){a(e,t)}function a(e,t){var a=e.geometry.coordinates,l=a[1]+","+a[0],i=parseInt($("#range__slider").val()),s="http://localhost:61002/api/isoline/"+l+"/"+i,o=function(l){isolinesQueried++;var i=l,s={type:"Feature",properties:{"marker-color":"#f00"},geometry:{type:"Point",coordinates:a}},o=turf.buffer(i,2e3,"meters"),n=turf.inside(s,o.features[0]);if(n){i.properties.osm_id=e.properties.osm_id,i.properties.name=e.properties.name,isolinesGeoJSON.features.push(i);var c=svg.select('g[data-id="'+t+'"]'),r=c.append("path").data([i]).attr("class","isoline").attr("data-id",t)}isolinesQueried==places_aoi.features.length&&(update(),activateButtons())};$.ajax({dataType:"json",url:s,success:o,error:function(e){alert(e)}})}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A",map=new mapboxgl.Map({container:"map",style:"mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi",zoom:11,center:[-73.12,10.41]}),console.log(map),map.addControl(new mapboxgl.Navigation),map.on("load",function(){isolineAll()});var l=map.getCanvasContainer();svg=d3.select(l).append("svg").attr("id","map-features");var i=d3.geo.transform({point:projectPoint});path=d3.geo.path().projection(i),gVillages=svg.append("g").attr("class","villages").selectAll("circle").data(e.features).enter().append("g").attr("data-id",function(e){return e.properties.osm_id}).attr("class","village-group").append("circle").attr({r:circleRadius}).attr("class","village").attr("data-id",function(e){return e.properties.osm_id}).on("click",function(e){d3.select(this).classed("selected",!0);var a=d3.select(this).attr("data-id");t(e,a)}),map.on("viewreset",update),map.on("move",update),update()}function update(e){if(e="undefined"!=typeof e?e:0,w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),"smallmultiples"===view){console.log("triggerSmallMultiplesView");var t=0,a=0,l=7,i=6,s=.8*w/(i+1),o=20,n=0,c=0;svg.selectAll(".village-group").each(function(e,t){var a=d3.select(this),l=a.node().getBBox().width,i=a.node().getBBox().height;i>c&&(c=i),l>n&&(n=l)});var r=.8*w/i,d=h/l-o,p=.2*w,u=d/c,m=r/n;console.log("max_path_w: "+n),console.log("max_path_h: "+c);var g=u;g>m&&(g=m),svg.selectAll(".village-group").each(function(s,n){var c=d3.select(this);c.transition().duration(e).style("opacity",1).attr("transform",function(){var e=p/g+(t+.5)*(r/g)-c.node().getBBox().x-c.node().getBBox().width/2,s=(a+.5)*((d+o)/g)-c.node().getBBox().y-c.node().getBBox().height/2;return t++,t===i&&(t=0),a++,a===l&&(a=0),"scale("+g+") translate("+e+","+s+")"}),c.selectAll("circle").transition().delay(e/6).duration(e).attr({r:4/g})}),setMapOpacity(.08)}else svg.selectAll(".village").attr({cx:function(e){return project(e.geometry.coordinates).x},cy:function(e){return project(e.geometry.coordinates).y}}),svg.selectAll(".isoline").each(function(e,t){var a=d3.select(this);a.attr("d",path)}),svg.selectAll(".village-group").each(function(t,a){var l=d3.select(this);l.transition().duration(e).attr("transform",""),l.selectAll("circle").transition().delay(e/100).duration(e).attr({r:circleRadius})}),setMapOpacity(1);console.log("UPDATE")}function project(e){return map.project(new mapboxgl.LngLat(+e[0],+e[1]))}function projectPoint(e,t){var a=map.project(new mapboxgl.LngLat(e,t));this.stream.point(a.x,a.y)}function enableMapInteraction(){map.scrollZoom.enable(),map.dragPan.enable(),d3.select("#map").classed("disabled",!1)}function disableMapInteraction(){map.scrollZoom.disable(),map.dragPan.disable(),d3.select("#map").classed("disabled",!0)}function switchLayer(e){"DIGENTI"==e?map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"DIGENTI-Light"==e?map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi"):"DIGENTI-Dark"==e?map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t"):"fos-outdoor"==e?map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):map.setStyle("mapbox://styles/mapbox/"+e)}function showValue(){var e=$("#range__slider").val();document.getElementById("range").innerHTML=e+" minutes"}function reorderSmallMultiples(e){orderby=e,d3.selectAll(".orderby").classed("active",!1),d3.selectAll("."+orderby).classed("active",!0),update(500)}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),enableMapInteraction(),view="map",update(500)}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!1),disableMapInteraction(),view="smallmultiples",update(500)}function setMapOpacity(e){d3.selectAll(".mapboxgl-canvas").transition().duration(500).style("opacity",e),d3.selectAll(".mapboxgl-control-container").transition().duration(500).style("opacity",e)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}function setMode(e){d3.selectAll("button.mode").classed("active",!1),currentMode=e,d3.select("."+e).classed("active",!0)}function isolineAll(){setMode("isoline-all"),$(".village").each(function(e){$(this).d3Click()})}var map,svg,gVillages,path,currentMode="isoline-all",view="mode",places_aoi,circleRadius=5,isolineColor="#3dc8e7";isolineOpacity=.35;var isolinesQueried=0,isolinesGeoJSON={type:"FeatureCollection",crs:{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}},features:[]};d3.json("../../data/places_aoi.json",function(e,t){places_aoi=t,mapDraw(t)});var basemap_select=document.getElementById("basemap_select"),basemap_select_options=basemap_select.options;basemap_select.onchange=function(){var e=basemap_select_options[basemap_select.selectedIndex].value;switchLayer(e)},showValue(),$.fn.d3Click=function(){this.each(function(e,t){var a=new MouseEvent("click");t.dispatchEvent(a)})};