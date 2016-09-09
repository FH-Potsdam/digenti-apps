function addLayer(e,a,t){app.layers[e]={},app.layers[e].active=a,app.layers[e].layer=new t}function init(){rangeSliderInput(),$.when($.getScript("js/routesLayer.js"),$.getScript("js/missingInfrastructureLayer.js"),$.getScript("js/isolinesLayer.js"),$.Deferred(function(e){$(e.resolve)})).done(function(){addLayer("routesfromvalledupar",!1,routesLayer),addLayer("missinginfrastructure",!1,missingInfrastructureLayer),addLayer("isolines",!1,isolinesLayer),d3.queue().defer(d3.json,"../../data/places_aoi.json").defer(d3.json,"../../data/street_points_aoi.json").await(function(e,a,t){if(e)throw e;places_aoi=a,street_points_aoi=t,mapDraw(places_aoi)})})}function hideSplashScreen(){$("#loader").removeClass("show"),setTimeout(function(){$("#loader").removeClass("displayed")},1e3)}function mapDraw(e){function a(e){"DIGENTI"===e?map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"DIGENTI-Light"===e?map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi"):"DIGENTI-Dark"===e?map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t"):"fos-outdoor"===e?map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):map.setStyle("mapbox://styles/mapbox/"+e)}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A";var t="dark"===app.config.theme?"mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t":"mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi";map=new mapboxgl.Map({container:"map",style:t,zoom:11,center:[-73.12,10.41]}),map.addControl(new mapboxgl.Navigation),map.on("viewreset",update),map.on("moveend",update),map.on("move",update),map.on("load",hideSplashScreen),svg=d3.select(map.getCanvasContainer()).append("svg").attr("class","map-features"),lineFunction=d3.svg.line().x(function(e){return project(e).x}).y(function(e){return project(e).y}).interpolate("linear"),settlementPointLayer=svg.append("g").attr("id","settlementPointLayer"),settlementPointLayer.selectAll("circle").data(places_aoi.features).enter().append("circle").attr("class","village").attr("r",app.config.circleRadius).on("click",function(e){var a=d3.select(this);a.classed("selected",!a.classed("selected")),clickCallback(e)}).attr("data-id",function(e){return e.properties.osm_id}).each(function(e){app.villagePositionsMap[e.properties.osm_id]={},app.villagePositionsMap[e.properties.osm_id].x=project(e.geometry.coordinates).x,app.villagePositionsMap[e.properties.osm_id].y=project(e.geometry.coordinates).y});for(var o in app.layers)app.layers.hasOwnProperty(o)&&app.layers[o].layer.init(svg,e);$("#basemap_select").change(function(){a($(this).val())})}function update(e){null!==e&&"object"==typeof e?e=0:isNaN(e)&&(e=app.config.transitionTime),app.layout=calculateLayoutVars(),settlementPointLayer.selectAll("circle").each(function(e){app.villagePositionsMap[e.properties.osm_id]={},app.villagePositionsMap[e.properties.osm_id].x=project(e.geometry.coordinates).x,app.villagePositionsMap[e.properties.osm_id].y=project(e.geometry.coordinates).y});for(var a in app.layers)app.layers.hasOwnProperty(a)&&app.layers[a].layer.calc();updateSettlementPointLayer(e);for(a in app.layers)app.layers.hasOwnProperty(a)&&app.layers[a].layer.render(e)}function reorderSmallMultiples(e){app.orderby=e,d3.selectAll(".orderby").classed("active",!1),d3.selectAll("."+app.orderby).classed("active",!0),update(app.config.transitionTime)}function setMode(e){app.mode=e;var a=0;"smallmultiples"===app.view&&(a=500);for(var t in app.layers)app.layers.hasOwnProperty(t)&&(e===t?app.layers[t].active=!0:app.layers[t].active=!1,app.layers[t].layer.setActive(app.layers[t].active),d3.selectAll(".mode."+t).classed("active",app.layers[t].active));update(app.config.transitionTime)}function toggleViews(){"smallmultiples"===app.view?triggerMapView():triggerSmallMultiplesView()}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),showMap(),enableMapInteraction(),app.view="",update(app.config.transitionTime)}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!1),hideMap(),disableMapInteraction(),app.view="smallmultiples",update(app.config.transitionTime)}function enableMapInteraction(){map.doubleClickZoom.enable(),map.scrollZoom.enable(),map.dragPan.enable(),d3.select("#map").classed("disabled",!1)}function disableMapInteraction(){map.doubleClickZoom.disable(),map.scrollZoom.disable(),map.dragPan.disable(),d3.select("#map").classed("disabled",!0)}function showMap(){d3.selectAll(".mapboxgl-canvas").classed("hidden",!1),d3.selectAll(".mapboxgl-canvas").classed("hidden",!1)}function hideMap(){d3.selectAll(".mapboxgl-canvas").classed("hidden",!0),d3.selectAll(".mapboxgl-canvas").classed("hidden",!0)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}function updateSettlementPointLayer(e){settlementPointLayer.moveToFront(),settlementPointLayer.selectAll("circle").each(function(){var a=d3.select(this),t=a.attr("data-id");isDefined(app.villagePositions[t])&&a.attr("opacity","1").transition().duration(e).attr("cx",app.villagePositions[t].x).attr("cy",app.villagePositions[t].y)})}function calculateLayoutVars(){var e={};return e.w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),e.h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),e.rows=7,e.cols=6,e.navWidth=Math.round($("#nav").width()),e.infoWidth=Math.round(parseInt($("#info").width())+parseInt($("#info").css("right"))),e.offsetLeft=e.navWidth+50,e.offsetTop=Math.round(.01*e.w),e.offsetBottom=Math.round(e.offsetTop),e.offsetRight=Math.round(e.offsetTop+e.infoWidth),e.gapX=Math.round(.008*e.w),e.gapY=Math.round(e.gapX),e.widthperelement=Math.round((e.w-e.offsetLeft-e.offsetRight-(e.cols-1)*e.gapX)/e.cols),e.heightperelement=Math.round((e.h-e.offsetTop-e.offsetBottom-(e.rows-1)*e.gapY)/e.rows),e}function project(e){return map.project(new mapboxgl.LngLat(+e[0],+e[1]))}function projectPoint(e,a){var t=map.project(new mapboxgl.LngLat(e,a));this.stream.point(t.x,t.y)}function isDefined(e){return"undefined"!=typeof e&&null!==e}function rangeSliderInput(){var e=parseInt($("#range__slider").val());$("#range__text").html(e+" min")}function clickCallback(e){$("#info").addClass("show"),$("#info .objectID").html(e.properties.osm_id),app.layout=calculateLayoutVars()}var map,svg,settlementPointLayer,lineFunction,places_aoi,street_points_aoi,routesArray=[],routesJSON={};routesJSON.routes=[];var app={};app.view="",app.mode="",app.orderby="size",app.layout=calculateLayoutVars(),app.layers=[],app.villagePositions=[],app.villagePositionsMap=[],$(document).ready(function(){$.when($.getScript("config.js"),$.Deferred(function(e){$(e.resolve)})).done(function(){app.config=config,console.log("DIGENTI APP started. Loading requirements…"),app.config.theme=$("body").hasClass("dark")?"dark":"light",console.log("Current config follows in next line:"),console.log(app),init()})}),d3.selection.prototype.moveToFront=function(){return this.each(function(){this.parentNode.appendChild(this)})};