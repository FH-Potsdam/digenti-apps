function showValue(){var e=$("#range__slider").val();document.getElementById("range").innerHTML=e+" minutes"}function isolineAll(){$(".village").each(function(e){$(this).d3Click()})}function mapDraw(e){function t(){p.addSource("colombia-fos",{type:"vector",url:"mapbox://jorditost.49a7b9e1"}),p.addLayer({id:"fos3",type:"line",source:"colombia-fos","source-layer":"colombia_fos_h1_m0_5_CLASSIFIED_wgs84",filter:["==","elev",3],layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#F7D57F","line-width":2,"line-opacity":.8}}),p.addLayer({id:"fos2",type:"line",source:"colombia-fos","source-layer":"colombia_fos_h1_m0_5_CLASSIFIED_wgs84",filter:["==","elev",2],layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#F5A623","line-width":2,"line-opacity":.8}}),p.addLayer({id:"fos1",type:"line",source:"colombia-fos","source-layer":"colombia_fos_h1_m0_5_CLASSIFIED_wgs84",filter:["==","elev",1],layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#ED5D5A","line-width":2,"line-opacity":.8}})}function o(){p.addSource("colombia-upstream-areas",{type:"vector",url:"mapbox://jorditost.0d82b46f"}),p.addLayer({id:"colombia-upstream-areas",type:"fill",source:"colombia-upstream-areas","source-layer":"upstream_areas_aoi",paint:{"fill-color":"#4f91ab","fill-opacity":.25},filter:["==","osm_id",""]})}function r(e,t){var o=document.getElementById("switch"),r=document.createElement("div");o.appendChild(r);var n=document.createElement("input");n.type="checkbox",n.id=t,n.checked=!0,r.appendChild(n);var a=document.createElement("label");a.setAttribute("for",t),a.textContent=e,r.appendChild(a),n.addEventListener("change",function(e){p.setLayoutProperty(t,"visibility",e.target.checked?"visible":"none")})}function n(e,t){var o=e.geometry.coordinates;"routing"===currentMode&&(routing_history.push(o[1]+","+o[0]),routing_history.length>1&&i(o)),"isoline"===currentMode&&a(o,t)}function a(e,t){var o=parseInt($("#range__slider").val()),r=(1e3*o).toString();c="geo!"+e[1]+","+e[0];var n={mode:"fastest;car",resolution:"1",maxpoints:"1000",rangetype:"time",start:c,distance:r},a=function(r){console.log(r);var n=r.Response.isolines[0].value;n=transformHEREgeometry(n);var a={type:"Feature",properties:{objectID:t},geometry:{type:"Polygon",coordinates:[n]}},i={type:"Feature",properties:{"marker-color":"#f00"},geometry:{type:"Point",coordinates:e}},s=turf.buffer(a,500,"meters"),l=turf.inside(i,s.features[0]);if(l){var c=[t+"-"+o,{type:"geojson",data:a}],u={id:"isoline_"+t+"-"+o,type:"fill",source:t+"-"+o,layout:{},paint:{"fill-color":"#088","fill-opacity":.1}};map_data_sources.push(c),map_data_layers.push(u),p.addSource(c[0],c[1]),p.addLayer(u)}};enterpriseRouter.calculateIsoline(n,a,function(e){alert(e.message)})}function i(e){function t(e){console.log(e)}function o(e){var t=e.response,o={init:function(){return this.id=generateUniqueID(),this.geometry=transformHEREgeometry(t.route[0].shape),this.travelTime=t.route[0].summary.travelTime,this.path=lineFunction(this.geometry),this}}.init();routes_collection.push(o);var r=gRoutes.append("path").attr("class","route").attr("d",o.path).attr("stroke-width",2);routes_paths.push(r),compareRouteWithCollection(o,routes_collection),s()}var r={mode:"fastest;car",representation:"display",routeattributes:"waypoints,summary,shape,legs",maneuverattributes:"direction,action",waypoint0:routing_history[routing_history.length-2],waypoint1:routing_history[routing_history.length-1],returnelevation:"true"};router.calculateRoute(r,o,t)}function s(){for(var e=0;e<routes_paths.length;e++)routes_paths[e].attr("d",lineFunction(pathData));for(var e=0;e<routes_points.length;e++)routes_points[e].attr({cx:function(e){return l(e).x},cy:function(e){return l(e).y}});for(var e=0;e<routes_foot_paths.length;e++)routes_foot_paths[e].attr("d",lineFunction(pathFootData));for(var e=0;e<routes_foot_points.length;e++)routes_foot_points[e].attr({cx:function(e){return l(e).x},cy:function(e){return l(e).y}});h.attr({cx:function(e){return l(e.geometry.coordinates).x},cy:function(e){return l(e.geometry.coordinates).y}}),console.log("UPDATE");for(var t=0;t<isolines_collection.length;t++)"undefined"!=typeof isolines_collection[t]&&isolines_collection[t].attr("points",function(e){for(var t=[],o=0;o<e.length;o++)t.push([l(e[o]).x,l(e[o]).y].join(","));return t.join(" ")})}function l(e){return p.project(new mapboxgl.LngLat(+e[0],+e[1]))}function u(e){"DIGENTI"==e?p.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"fos-outdoor"==e?p.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):p.setStyle("mapbox://styles/mapbox/"+e)}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A";var p=new mapboxgl.Map({container:"map",style:"mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t",zoom:11,center:[-73.02,10.41]});p.addControl(new mapboxgl.Navigation),p.on("style.load",function(){var r=new mapboxgl.GeoJSONSource({data:e});p.addSource("places",r),p.addLayer({id:"places",interactive:!0,type:"circle",source:"places",paint:{"circle-radius":8,"circle-opacity":.3,"circle-color":"#f00"}}),t(),o(),$.each(map_data_sources,function(e,t){p.addSource(t[0],t[1])}),$.each(map_data_layers,function(e,t){p.addLayer(t)})}),r("FOS 1","fos1"),r("FOS 2","fos2"),r("FOS 3","fos3");var d=p.getCanvasContainer(),f=d3.select(d).append("svg").attr("class","map-morphed"),m=d3.select(d).append("svg").attr("class","map-features");gRoutes=m.append("g").attr("class","routes");var y=f.append("g").attr("class","route-lines");isolinesGroup=m.append("g").attr("class","isolinesGroup");var h=m.append("g").attr("class","villages").selectAll("circle").data(e.features).enter().append("circle").attr({r:8}).attr("class","village").attr("data-id",function(){return generateUniqueID()}).on("click",function(e){d3.select(this).classed("selected",!0);var t=d3.select(this).attr("data-id");n(e,t)}).on("mouseover",function(e){p.setFilter("colombia-upstream-areas",["==","osm_id",e.properties.osm_id])}).on("mouseout",function(e){p.setFilter("colombia-upstream-areas",["==","osm_id",""])});lineFunction=d3.svg.line().x(function(e){return l(e).x}).y(function(e){return l(e).y}).interpolate("linear"),p.on("viewreset",s),p.on("movestart",function(){m.classed("hidden",!0)}),p.on("moveend",function(){s(),m.classed("hidden",!1)}),s();var g=document.getElementById("basemap_select"),v=g.options;g.onchange=function(){var e=v[g.selectedIndex].value;u(e)}}function getRandomInt(e,t){return Math.floor(Math.random()*(t-e))+e}function generateUniqueID(){return"id"+(new Date).getTime().toString()+Math.random().toString(36).substr(2,16)}function transformHEREgeometry(e){for(var t=0;t<e.length;t++){e[t]=e[t].split(",");for(var o=0;o<e[t].length;o++)e[t][o]=parseFloat(e[t][o]);var r=e[t][0];e[t][0]=e[t][1],e[t][1]=r}return e}function getOverlappingGeometry(e,t){for(var o=[],r=0;r<e.length;r++)for(var n=0;n<t.length;n++)e[r].equals(t[n])&&o.push(e[r]);return o}function compareRouteWithCollection(e,t){if(t.length>1)for(var o=0;o<t.length;o++)if(e.id!==t[o].id){var r=getOverlappingGeometry(e.geometry,t[o].geometry);if(r.length>0){var n=gRoutes.append("path").attr("class","route").attr("d",lineFunction(r)).attr("stroke-width",8);routes_paths.push(n)}}}function setMode(e){d3.selectAll("button.mode").classed("active",!1),currentMode=e,d3.select("."+e).classed("active",!0)}var platform=new H.service.Platform({app_id:"EOg7UyuSFbPF0IG5ANjz",app_code:"iRnqNl0dyzX_8FOlchD0ZQ"}),router=platform.getRoutingService(),enterpriseRouter=platform.getEnterpriseRoutingService();showValue(),$.fn.d3Click=function(){this.each(function(e,t){var o=new MouseEvent("click");t.dispatchEvent(o)})};var linePadding=15;d3.json("../../data/places_aoi.json",function(e,t){mapDraw(t)});var routes_points=[],routes_paths=[],lines_paths=[],routes_foot_points=[],routes_foot_paths=[],routing_history=[],pathData,pathFootData,routes_collection=[],gRoutes,lineFunction,currentMode,isoline,isolines_collection=[],isolinesGroup,map_data_sources=[],map_data_layers=[];Array.prototype.equals&&console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."),Array.prototype.equals=function(e){if(!e)return!1;if(this.length!=e.length)return!1;for(var t=0,o=this.length;t<o;t++)if(this[t]instanceof Array&&e[t]instanceof Array){if(!this[t].equals(e[t]))return!1}else if(this[t]!=e[t])return!1;return!0},Object.defineProperty(Array.prototype,"equals",{enumerable:!1});