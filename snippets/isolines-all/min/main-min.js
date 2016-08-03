function OpenInNewTab(e){var t=window.open(e,"_blank");t.focus()}function generateUniqueID(){return"id"+(new Date).getTime().toString()+Math.random().toString(36).substr(2,16)}function getRandomInt(e,t){return Math.floor(Math.random()*(t-e))+e}function transformHEREgeometry(e){for(var t=0;t<e.length;t++){e[t]=e[t].split(",");for(var a=0;a<e[t].length;a++)e[t][a]=parseFloat(e[t][a]);var o=e[t][0];e[t][0]=e[t][1],e[t][1]=o}return e}function getGEOJSON(e){var t=JSON.stringify(e);OpenInNewTab("data:text/plain;charset=utf-8,"+encodeURIComponent(t))}function mapDraw(e){function t(e,t){var o=e.geometry.coordinates;"isoline"!==currentMode&&"isoline-all"!==currentMode||a(o,t)}function a(e,t){var a=e[1]+","+e[0],o=parseInt($("#range__slider").val()),i="http://localhost:61002/api/isoline/"+a+"/"+o,n=function(a){isolinesLoaded++;var o=a;o.properties.objectID=t;var i={type:"Feature",properties:{"marker-color":"#f00"},geometry:{type:"Point",coordinates:e}},n=turf.buffer(o,500,"meters"),l=turf.inside(i,n.features[0]);if(l){map.addSource(t,{type:"geojson",data:o}),map.addLayer({id:"isoline_"+t,type:"fill",source:t,layout:{},paint:{"fill-color":isolineColor,"fill-opacity":isolineOpacity}});var s=svg.select('g[data-id="'+t+'"]').append("path").data([o]).attr("class","isoline").attr("data-id",t)}isolinesLoaded==places_aoi.features.length&&(update(),activateButtons())};$.ajax({dataType:"json",url:i,success:n,error:function(e){alert(e)}})}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A",map=new mapboxgl.Map({container:"map",style:"mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi",zoom:11,center:[-73.06,10.41]}),map.addControl(new mapboxgl.Navigation),map.on("load",function(){isolineAll()});var o=map.getCanvasContainer();svg=d3.select(o).append("svg").attr("id","map-features");var i=d3.geo.transform({point:projectPoint});path=d3.geo.path().projection(i),gVillages=svg.append("g").attr("class","villages").selectAll("circle").data(e.features).enter().append("g").attr("data-id",function(e){return e.properties.osm_id}).attr("class","village-group").append("circle").attr({r:circleRadius}).attr("class","village").attr("data-id",function(e){return e.properties.osm_id}).on("click",function(e){d3.select(this).classed("selected",!0);var a=d3.select(this).attr("data-id");t(e,a)}),map.on("viewreset",update),map.on("movestart",function(){svg.classed("hidden",!0)}),map.on("moveend",function(){update(),svg.classed("hidden",!1)}),update()}function update(e){if(e=void 0===typeof e?0:e,w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),"smallmultiples"===view){console.log("triggerSmallMultiplesView");var t=0,a=0,o=7,i=6,n=.8*w/(i+1),l=20,s=0,r=0;svg.selectAll(".village-group").each(function(e,t){console.log("village: "+t);var a=d3.select(this),o=a.node().getBBox().width,i=a.node().getBBox().height;i>r&&(r=i),o>s&&(s=o)});var c=.8*w/i,d=h/o-l,p=.2*w,u=d/r,m=c/s;console.log("max_path_w: "+s),console.log("max_path_h: "+r);var g=u;g>m&&(g=m),svg.selectAll(".village-group").each(function(n,s){var r=d3.select(this);r.transition().duration(e).style("opacity",1).attr("transform",function(){var e=p/g+(t+.5)*(c/g)-r.node().getBBox().x-r.node().getBBox().width/2,n=(a+.5)*((d+l)/g)-r.node().getBBox().y-r.node().getBBox().height/2;return t++,t===i&&(t=0),a++,a===o&&(a=0),"scale("+g+") translate("+e+","+n+")"}).selectAll("path").attr("stroke-width",function(){return 2/g}),r.selectAll("circle").transition().delay(e/6).duration(e).attr({r:4/g})}),setMapOpacity(.08)}else svg.selectAll(".village").attr({cx:function(e){return project(e.geometry.coordinates).x},cy:function(e){return project(e.geometry.coordinates).y}}),svg.selectAll(".isoline").each(function(e,t){var a=d3.select(this);a.attr("d",path)}),svg.selectAll(".village-group").each(function(t,a){var o=d3.select(this);o.transition().duration(e).attr("transform",""),o.selectAll("circle").transition().delay(e/100).duration(e).attr({r:circleRadius})}),setMapOpacity(1);console.log("UPDATE")}function project(e){return map.project(new mapboxgl.LngLat(+e[0],+e[1]))}function projectPoint(e,t){var a=map.project(new mapboxgl.LngLat(e,t));this.stream.point(a.x,a.y)}function switchLayer(e){"DIGENTI"==e?map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"DIGENTI-Light"==e?map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi"):"DIGENTI-Dark"==e?map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t"):"fos-outdoor"==e?map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):map.setStyle("mapbox://styles/mapbox/"+e)}function showValue(){var e=$("#range__slider").val();document.getElementById("range").innerHTML=e+" minutes"}function reorderSmallMultiples(e){orderby=e,d3.selectAll(".orderby").classed("active",!1),d3.selectAll("."+orderby).classed("active",!0),update(500)}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),view="map",update(500)}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!1),view="smallmultiples",update(500)}function setMapOpacity(e){d3.selectAll(".mapboxgl-canvas").transition().duration(500).style("opacity",e),d3.selectAll(".mapboxgl-control-container").transition().duration(500).style("opacity",e)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}function setMode(e){d3.selectAll("button.mode").classed("active",!1),currentMode=e,d3.select("."+e).classed("active",!0)}function isolineAll(){setMode("isoline-all"),$(".village").each(function(e){$(this).d3Click()})}Array.prototype.equals&&console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."),Array.prototype.equals=function(e){if(!e)return!1;if(this.length!=e.length)return!1;for(var t=0,a=this.length;a>t;t++)if(this[t]instanceof Array&&e[t]instanceof Array){if(!this[t].equals(e[t]))return!1}else if(this[t]!==e[t])return!1;return!0},Object.defineProperty(Array.prototype,"equals",{enumerable:!1}),Array.prototype.remove=function(e,t){var a=this.slice((t||e)+1||this.length);return this.length=0>e?this.length+e:e,this.push.apply(this,a)};var concaveman=require("concaveman"),map,svg,gVillages,path,currentMode="isoline-all",view="mode",places_aoi,circleRadius=5,isolinesLoaded=0,isolineColor="#3dc8e7";isolineOpacity=.35,d3.json("../../data/places_aoi.json",function(e,t){places_aoi=t,mapDraw(t)});var basemap_select=document.getElementById("basemap_select"),basemap_select_options=basemap_select.options;basemap_select.onchange=function(){var e=basemap_select_options[basemap_select.selectedIndex].value;switchLayer(e)},showValue(),$.fn.d3Click=function(){this.each(function(e,t){var a=new MouseEvent("click");t.dispatchEvent(a)})};