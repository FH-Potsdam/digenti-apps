function mapDraw(t){function e(t,e){var a=document.getElementById("switch"),n=document.createElement("div");a.appendChild(n);var o=document.createElement("input");o.type="checkbox",o.id=e,o.checked=!0,n.appendChild(o);var r=document.createElement("label");r.setAttribute("for",e),r.textContent=t,n.appendChild(r),o.addEventListener("change",function(t){map.setLayoutProperty(e,"visibility",t.target.checked?"visible":"none")})}function a(t){}function n(t,e,a){function n(t){console.log(t)}function o(t){gSM.selectAll("g[data-id='"+t.id+"']").append("path").attr("data-id",t.id).attr("data-traveltime",t.travelTime).attr("class","route").attr("d",t.path).attr("stroke-width",2),routes_geo[t.id]=t.geometry,routes_collection.push(t),update(500)}function r(t){var e={init:function(){return this.id=a,this.geometry=transformHEREgeometry(t.response.route[0].shape),this.travelTime=t.response.route[0].summary.travelTime,this.path=lineFunction(this.geometry),this}}.init(),n={};n.id=a,n.route=e,routesJSON.routes.push(n),o(e)}var i={mode:"fastest;car",representation:"display",routeattributes:"waypoints,summary,shape,legs",maneuverattributes:"direction,action",waypoint0:t,waypoint1:e,returnelevation:"true"};routesJSON.routes.length>0?(console.log("ROUTING CACHED"),o(routesArray[a])):(console.log("ROUTING VIA API"),router.calculateRoute(i,r,n))}function o(t){"DIGENTI"===t?map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"DIGENTI-Light"===t?map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi"):"DIGENTI-Dark"===t?map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t"):"fos-outdoor"===t?map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):map.setStyle("mapbox://styles/mapbox/"+t)}function r(t,e){for(var a=[],n=0;n<t.length;n++)for(var o=0;o<e.length;o++)t[n].equals(e[o])&&a.push(t[n]);return a}function i(t,e){if(e.length>1)for(var a=0;a<e.length;a++)if(t.id!==e[a].id){var n=r(t.geometry,e[a].geometry);if(n.length>0){for(var o=n.length.toString().concat(n[0][0].toString()).concat(n[0][1].toString()),i=!1,l=0;l<overlapping_routes.length;l++)if(overlapping_routes[l]===o){i=!0;break}if(!i){overlapping_routes.push(o),s(n[0]),s(n[n.length-1]);var c={};c.type="Feature",c.geometry={},c.geometry.type="LineString",c.geometry.coordinates=n,c.properties={},resultingGEOJSON.features.push(c)}}}}function s(t){for(var e=!0,a=0;a<knotpoints.length;a++){for(var n=!0,o=0;o<t.length-1;o++)knotpoints[a][o]!==t[o]&&(n=!1);n&&(e=!1)}}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A",map=new mapboxgl.Map({container:"map",style:"mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi",zoom:11,center:[-73.02,10.41]}),map.addControl(new mapboxgl.Navigation),map.on("style.load",function(){$.each(map_data_sources,function(t,e){map.addSource(e[0],e[1])}),$.each(map_data_layers,function(t,e){map.addLayer(e)})});var l=map.getCanvasContainer(),c=d3.select(l).append("svg").attr("class","map-features");gRouteParts=c.append("g").attr("class","routeparts"),gSM=c.append("g").attr("class","smallmultiples"),gSM.selectAll("circle").data(t.features).enter().append("g").attr("data-id",function(t){return t.properties.osm_id}).append("circle").attr({r:8}).attr("class","village").on("click",function(t){d3.select(this).classed("selected",!0);var e=d3.select(this).attr("data-id");a(t,e)}),lineFunction=d3.svg.line().x(function(t){return project(t).x}).y(function(t){return project(t).y}).interpolate("linear"),triggerMapView(),gSM.selectAll("g").each(function(t){var e=d3.select(this),a="10.471667,-73.25",o=t.geometry.coordinates[1]+","+t.geometry.coordinates[0];n(a,o,e.attr("data-id"))}),map.on("viewreset",update),map.on("moveend",update),map.on("move",update),update(500);var u=document.getElementById("basemap_select"),d=u.options;u.onchange=function(){var t=d[u.selectedIndex].value;o(t)}}function update(t){if("smallmultiples"===config.view){console.log("triggerSmallMultiplesView");var e=0,a=0,n=7,o=6,r=20,i=0,s=0;gSM.selectAll("g").each(function(){var t=d3.select(this).node().getBBox(),e=t.width,a=t.height;a>s&&(s=a),e>i&&(i=e)});var l=.8*w/o,c=h/n-r,u=.2*w,d=c/s,p=l/i,m=d;m>p&&(m=p),gSM.selectAll("g").each(function(i,s){var d=d3.select(this);d.transition().duration(t).style("opacity",1).attr("transform",function(){var t=u/m+(e+.5)*(l/m)-d.node().getBBox().x-d.node().getBBox().width/2,i=(a+.5)*((c+r)/m)-d.node().getBBox().y-d.node().getBBox().height/2;return e++,e===o&&(e=0),a++,a===n&&(a=0),"scale("+m+") translate("+t+","+i+")"})}),gSM.selectAll("g").each(function(){var e=d3.select(this);e.selectAll("path").transition().duration(t).attr("stroke-width",function(){return 2/m}),e.selectAll("circle").transition().duration(t).attr({r:4/m})}),setMapOpacity(.08),disableMapInteraction()}else setMapOpacity(1),enableMapInteraction(),gSM.selectAll("g").each(function(){var e=d3.select(this);e.transition().duration(t).style("opacity",1).attr("stroke-width",2).attr("transform",function(){return""}),e.selectAll("path").each(function(){var t=d3.select(this);t.attr("d",lineFunction(routes_geo[t.attr("data-id")]))}).transition().duration(t).attr("stroke-width",function(){return 2}),e.selectAll("circle").attr({cx:function(t){return project(t.geometry.coordinates).x},cy:function(t){return project(t.geometry.coordinates).y}}).transition().duration(t).attr({r:8})})}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),config.view="",update(500)}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!1),config.view="smallmultiples",update(500)}function setMapOpacity(t){d3.selectAll(".mapboxgl-canvas").transition().duration(500).style("opacity",t),d3.selectAll(".mapboxgl-control-container").transition().duration(500).style("opacity",t)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}function enableMapInteraction(){map.scrollZoom.enable(),map.dragPan.enable()}function disableMapInteraction(t){map.scrollZoom.enable(),map.dragPan.enable()}function project(t){return map.project(new mapboxgl.LngLat(+t[0],+t[1]))}var platform=new H.service.Platform({app_id:"EOg7UyuSFbPF0IG5ANjz",app_code:"iRnqNl0dyzX_8FOlchD0ZQ"}),router=platform.getRoutingService(),w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),routing_history=[],routes_collection=[],map_data_sources=[],map_data_layers=[],knotpoints=[],overlapping_routes=[],lineFunction,gRouteParts,gSM,currentMode,map,routes_geo=[],routesArray=[],routesJSON={};routesJSON.routes=[];var resultingGEOJSON={};resultingGEOJSON.type="FeatureCollection",resultingGEOJSON.features=[];var config={};config.view="",d3.json("../../data/places_aoi.json",function(t,e){$.get("data/routes_cached.json").done(function(){d3.json("data/routes_cached.json",function(t,a){routesJSON=a;for(var n=0;n<routesJSON.routes.length;n++)routesArray[routesJSON.routes[n].id]=routesJSON.routes[n].route;mapDraw(e)})}).fail(function(){mapDraw(e)})});