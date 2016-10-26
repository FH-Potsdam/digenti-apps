function addLayer(e,t,a){app.layers[e]={},app.layers[e].active=t,app.layers[e].layer=new a}function init(){d3.queue().defer(d3.json,"../../data/places_aoi.json").defer(d3.json,"../../data/street_points_aoi.json").await(function(e,t,a){if(e)throw e;places_aoi=t,street_points_aoi=a,mapDraw(places_aoi)})}function hideSplashScreen(){$("#loader").removeClass("show"),setTimeout(function(){$("#loader").removeClass("displayed")},1e3)}function mapDraw(e){function t(e){"DIGENTI"===e?map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"DIGENTI-Light"===e?map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi"):"DIGENTI-Dark"===e?map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t"):"fos-outdoor"===e?map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):map.setStyle("mapbox://styles/mapbox/"+e)}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A";var a="dark"===app.config.theme?"mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t":"mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi";map=new mapboxgl.Map({container:"map",style:a,zoom:11.4,center:[-73.12,10.41]}),map.dragRotate.disable(),map.touchZoomRotate.disableRotation(),map.keyboard.disable(),map.boxZoom.disable(),config.tabletop&&$(document).bind("contextmenu",function(e){e.preventDefault()}),$(document).keydown(function(e){e.ctrlKey!==!0||"61"!==e.which&&"107"!==e.which&&"173"!==e.which&&"109"!==e.which&&"187"!==e.which&&"189"!==e.which||e.preventDefault()}),$(window).bind("mousewheel DOMMouseScroll",function(e){e.ctrlKey===!0&&e.preventDefault()}),map.addControl(new mapboxgl.Navigation),map.on("viewreset",update),map.on("moveend",update),map.on("move",update),map.on("load",hideSplashScreen),svg=d3.select(map.getCanvasContainer()).append("svg").attr("class","map-features"),lineFunction=d3.svg.line().x(function(e){return project(e).x}).y(function(e){return project(e).y}).interpolate("linear"),settlementPointLayer=svg.append("g").attr("id","settlement-point-layer"),settlementPointLayer.selectAll("circle").data(places_aoi.features).enter().append("circle").attr("class","village").attr("r",app.config.circleRadius).on("click",function(e){var t=d3.select(this);t.classed("selected",!t.classed("selected")),clickCallback(e)}).attr("data-id",function(e){return e.properties.osm_id}).each(function(e){app.villagePositionsMap[e.properties.osm_id]={},app.villagePositionsMap[e.properties.osm_id].x=project(e.geometry.coordinates).x,app.villagePositionsMap[e.properties.osm_id].y=project(e.geometry.coordinates).y});for(var o in app.layers)app.layers.hasOwnProperty(o)&&app.layers[o].layer.init(svg,e);$("#basemap_select").change(function(){t($(this).val())}),update(0)}function update(e){null!==e&&"object"==typeof e?e=0:isNaN(e)&&(e=app.config.transitionTime),app.layout=calculateLayoutVars(),settlementPointLayer.selectAll("circle").each(function(e){app.villagePositionsMap[e.properties.osm_id]={},app.villagePositionsMap[e.properties.osm_id].x=project(e.geometry.coordinates).x,app.villagePositionsMap[e.properties.osm_id].y=project(e.geometry.coordinates).y});for(var t in app.layers)app.layers.hasOwnProperty(t)&&app.layers[t].layer.calc();""===app.mode&&(app.villagePositions=app.villagePositionsMap.slice()),updateSettlementPointLayer(e);for(t in app.layers)app.layers.hasOwnProperty(t)&&app.layers[t].layer.render(e)}function setMode(e){app.mode=e;var t=0;"smallmultiples"===app.view&&(t=500);for(var a in app.layers)app.layers.hasOwnProperty(a)&&(e===a?app.layers[a].active=!0:app.layers[a].active=!1,app.layers[a].layer.setActive(app.layers[a].active),d3.selectAll(".mode#"+a).classed("active",app.layers[a].active));"isolines"===app.mode?$("#isolines-ui").removeClass("disabled"):$("#isolines-ui").addClass("disabled"),update(app.config.transitionTime)}function toggleViews(){"smallmultiples"===app.view?triggerMapView():triggerSmallMultiplesView()}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),showMap(),enableMapInteraction(),app.view="",update(app.config.transitionTime)}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!1),hideMap(),disableMapInteraction(),app.view="smallmultiples",update(app.config.transitionTime)}function reorderSmallMultiples(e){app.orderby=e,d3.selectAll(".orderby").classed("active",!1),d3.selectAll("."+app.orderby).classed("active",!0),update(app.config.transitionTime)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}function enableMapInteraction(){map.doubleClickZoom.enable(),map.scrollZoom.enable(),map.dragPan.enable(),d3.select("#map").classed("disabled",!1)}function disableMapInteraction(){map.doubleClickZoom.disable(),map.scrollZoom.disable(),map.dragPan.disable(),d3.select("#map").classed("disabled",!0)}function showMap(){d3.selectAll(".mapboxgl-canvas").classed("hidden",!1),d3.selectAll(".mapboxgl-canvas").classed("hidden",!1)}function hideMap(){d3.selectAll(".mapboxgl-canvas").classed("hidden",!0),d3.selectAll(".mapboxgl-canvas").classed("hidden",!0)}function updateSettlementPointLayer(e){settlementPointLayer.selectAll("circle").each(function(){var t=d3.select(this),a=t.attr("data-id");isDefined(app.villagePositions[a])&&t.transition().duration(e).attr("cx",app.villagePositions[a].x).attr("cy",app.villagePositions[a].y)})}function calculateLayoutVars(){var e={};return e.w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),e.h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),e.rows=7,e.cols=6,$nav?e.navWidth=Math.round($nav.width()):e.navWidth=Math.round($("#nav").width()),$infoBox?(e.infoWidth=Math.round(parseInt($infoBox.width())+parseInt($infoBox.css("right"))),e.microvisWidth=parseInt($infoBox.find(".content").width())):(e.infoWidth=Math.round(parseInt($("#info").width())+parseInt($("#info").css("right"))),e.microvisWidth=parseInt($("#info .content").width())),e.offsetLeft=e.navWidth+50,e.offsetTop=Math.round(.01*e.w),e.offsetBottom=Math.round(e.offsetTop),e.offsetRight=Math.round(e.offsetTop+e.infoWidth),e.gapX=Math.round(.008*e.w),e.gapY=Math.round(e.gapX),e.widthperelement=Math.round((e.w-e.offsetLeft-e.offsetRight-(e.cols-1)*e.gapX)/e.cols),e.heightperelement=Math.round((e.h-e.offsetTop-e.offsetBottom-(e.rows-1)*e.gapY)/e.rows),e}function project(e){return map.project(new mapboxgl.LngLat(+e[0],+e[1]))}function projectPoint(e,t){var a=map.project(new mapboxgl.LngLat(e,t));this.stream.point(a.x,a.y)}function isDefined(e){return"undefined"!=typeof e&&null!==e}function getElementByPlaceID(e,t){var a=$.grep(t,function(t,a){return t.id===e});return a.length>0?a[0]:null}function showInfoBox(e){$infoBox||($infoBox=$("#info")),$infoBox.find(".title").text(e.properties.name),$infoBox.find(".type").next("dd").text(String(e.properties.type).capitalize()),$infoBox.find(".population").next("dd").text(getPlacePopulation(e.properties)),$infoBox.find(".elevation").next("dd").text(parseInt(e.geometry.coordinates[2])+"m"),$infoBox.find(".objectID").next("dd").text(e.properties.osm_id),$infoBox.addClass("show"),$infoBox.find(".close").one("click",function(e){$infoBox.removeClass("show")})}function clickCallback(e){map.flyTo({center:e.geometry.coordinates,zoom:app.config.mapZoomDetail}),loadFOSBySettlement(e)}function loadFOSBySettlement(e){var t=e.properties.osm_id,a=e.geometry.coordinates,o=a[1]+","+a[0],i=app.config.apiBase+"/fos/point/"+o+"/1200",n=function(e){var a=new mapboxgl.GeoJSONSource({data:e});map.addSource("colombia-fos-"+t,a),map.addLayer({id:"fos3-"+t,type:"fill",source:"colombia-fos-"+t,filter:["==","fos",3],paint:{"fill-color":"#F7D57F","fill-opacity":.8,"fill-antialias":!1}}),map.addLayer({id:"fos2-"+t,type:"fill",source:"colombia-fos-"+t,filter:["==","fos",2],paint:{"fill-color":"#F5A623","fill-opacity":.8,"fill-antialias":!1}}),map.addLayer({id:"fos1-"+t,type:"fill",source:"colombia-fos-"+t,filter:["==","fos",1],paint:{"fill-color":"#ED5D5A","fill-opacity":.8,"fill-antialias":!1}})};$.ajax({dataType:"json",url:i,success:n,error:function(e){alert(e)}})}var map,svg,settlementPointLayer,lineFunction,places_aoi,street_points_aoi,routesArray=[],routesJSON={};routesJSON.routes=[];var app={};app.view="",app.mode="",app.orderby="size",app.layers=[],app.villagePositions=[],app.villagePositionsMap=[];var $body,$nav,$infoBox,$rangeSlider,$rangeText;$(document).ready(function(){$body=$("body"),$nav=$("#nav"),$infoBox=$("#info"),app.layout=calculateLayoutVars(),$.when($.getScript("config.js"),$.Deferred(function(e){$(e.resolve)})).done(function(){app.config=config,console.log("DIGENTI APP started. Loading requirements…"),"undefined"==typeof app.config.theme&&(app.config.theme="light"),$body.addClass(app.config.theme),app.config.tabletop&&$body.addClass("tabletop"),console.log("Current config follows in next line:"),console.log(app),init()})}),d3.selection.prototype.moveToFront=function(){return this.each(function(){this.parentNode.appendChild(this)})};