function mapDraw(e){function t(){$("#loader").removeClass("show"),setTimeout(function(){$("#loader").removeClass("displayed")},1e3)}function s(e){"DIGENTI"===e?map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"DIGENTI-Light"===e?map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi"):"DIGENTI-Dark"===e?map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t"):"fos-outdoor"===e?map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):map.setStyle("mapbox://styles/mapbox/"+e)}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A",map=new mapboxgl.Map({container:"map",style:"mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi",zoom:11,center:[-73.02,10.41]}),map.addControl(new mapboxgl.Navigation),map.on("viewreset",update),map.on("moveend",update),map.on("move",update),map.on("load",t),svg=d3.select(map.getCanvasContainer()).append("svg").attr("class","map-features"),lineFunction=d3.svg.line().x(function(e){return project(e).x}).y(function(e){return project(e).y}).interpolate("linear"),settlementPointLayer=svg.append("g").attr("class","settlementPointLayer").style("opacity",0),settlementPointLayer.selectAll("circle").data(places_aoi.features).enter().append("circle").attr("fill","green").attr("r",config.circleRadius).attr("data-id",function(e){return e.properties.osm_id}),config.layers.gsm.init(svg,e),config.layers.missingInfrastructure.init(svg,e),config.layers.isolines.init(svg,e),triggerMapView(),setMode("missinginfrastructure"),update(0);var i=document.getElementById("basemap_select"),a=i.options;i.onchange=function(){var e=a[i.selectedIndex].value;s(e)}}function update(e){isNaN(e)&&(e=0),config.layout=calculateLayoutVars(),config.layers.gsm.update(e),config.layers.missingInfrastructure.update(e),config.layers.isolines.update(e),updateSettlementPointLayer()}function reorderSmallMultiples(e){config.orderby=e,d3.selectAll(".orderby").classed("active",!1),d3.selectAll("."+config.orderby).classed("active",!0),update(500)}function setMode(e){config.mode=e,console.log("Set Mode: "+config.mode),settlementPointLayer.style("opacity",1),d3.selectAll(".mode").classed("active",!1),"missinginfrastructure"===config.mode?(d3.selectAll(".mode.missinginfrastructure").classed("active",!0),config.layers.missingInfrastructure.setActive(!0),config.layers.gsm.setActive(!1),config.layers.isolines.setActive(!1),update(500)):"routesfromvalledupar"===config.mode?(d3.selectAll(".mode.routesfromvalledupar").classed("active",!0),config.layers.missingInfrastructure.setActive(!1),config.layers.gsm.setActive(!0),config.layers.isolines.setActive(!1),update(500)):"isolines"===config.mode&&(d3.selectAll(".mode.isolines").classed("active",!0),config.layers.missingInfrastructure.setActive(!1),config.layers.gsm.setActive(!1),config.layers.isolines.setActive(!0),update(500)),settlementPointLayer.style("opacity",0)}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),enableMapInteraction(),config.view="",update(500)}function triggerMapDistancesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapdistancesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),enableMapInteraction(),config.view="map-distances",update(500)}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!1),disableMapInteraction(),config.view="smallmultiples",update(500)}function setMapOpacity(e){d3.selectAll(".mapboxgl-canvas").transition().duration(500).style("opacity",e),d3.selectAll(".mapboxgl-control-container").transition().duration(500).style("opacity",e)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}function updateSettlementPointLayer(){"isolines"===config.mode?test123(config.layers.isolines.bcr):"routesfromvalledupar"===config.mode?test123(config.layers.gsm.bcr):"missinginfrastructure"===config.mode&&test123(config.layers.missingInfrastructure.bcr)}function test123(e){isDefined(e)&&settlementPointLayer.selectAll("circle").each(function(){var t=d3.select(this),s=t.attr("data-id");isDefined(e[s])&&t.transition().duration(500).attr("cx",e[s].left+config.circleRadius).attr("cy",e[s].top+config.circleRadius)})}function enableMapInteraction(){map.scrollZoom.enable(),map.dragPan.enable(),d3.select("#map").classed("disabled",!1)}function disableMapInteraction(){map.scrollZoom.disable(),map.dragPan.disable(),d3.select("#map").classed("disabled",!0)}function selectSettlement(e){console.log(e),$("p.objectID").html(e)}function calculateLayoutVars(){var e={};return e.w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),e.h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),e.rows=7,e.cols=6,e.gap_hor=.8*e.w/(e.cols+1),e.gap_ver=e.h/(e.rows+1),e.offsetLeft=.25*e.w,e.offsetRight=30,e.offsetTop=.1*e.h,e.offsetBottom=30,e.gapX=15,e.gapY=10,e}function project(e){return map.project(new mapboxgl.LngLat(+e[0],+e[1]))}function projectPoint(e,t){var s=map.project(new mapboxgl.LngLat(e,t));this.stream.point(s.x,s.y)}function isDefined(e){return"undefined"!=typeof e&&null!==e}var platform=new H.service.Platform({app_id:"EOg7UyuSFbPF0IG5ANjz",app_code:"iRnqNl0dyzX_8FOlchD0ZQ"}),router=platform.getRoutingService(),layoutdebug=!1,map,svg,settlementPointLayer,lineFunction,places_aoi,street_points_aoi,routesArray=[],routesJSON={};routesJSON.routes=[];var config={};config.view="",config.mode="",config.orderby="size",config.layout={},config.circleRadius=5,config.layers={},$.getScript("js/routesLayer.js",function(e,t,s){config.layers.gsm=new routesLayer,$.getScript("js/missingInfrastructureLayer.js",function(e,t,s){config.layers.missingInfrastructure=new missingInfrastructureLayer,$.getScript("js/isolinesLayer.js",function(e,t,s){config.layers.isolines=new isolinesLayer,d3.json("../../data/places_aoi.json",function(e,t){places_aoi=t,d3.json("../../data/street_points_aoi.json",function(e,s){street_points_aoi=s,$.get("data/routes_cached.json").done(function(){d3.json("data/routes_cached.json",function(e,s){routesJSON=s;for(var i=0;i<routesJSON.routes.length;i++)routesArray[routesJSON.routes[i].id]=routesJSON.routes[i].route;mapDraw(t)})}).fail(function(){mapDraw(t)})})})})})});