function addLayer(e,t,i){app.layers[e]={},app.layers[e].active=t,app.layers[e].layer=new i}function init(){$.ajax({url:app.config.apiBase,type:"HEAD",error:function(){$(".spinner").remove(),$(".alert").html("Can't reach API under <i>"+app.config.apiBase+"</i>. It seems to be offline.<br>Please start the API and reload the app.")},success:function(){$.when($.getScript("js/routesLayer.js"),$.getScript("js/missingInfrastructureLayer.js"),$.getScript("js/isolinesLayer.js"),$.Deferred(function(e){$(e.resolve)})).done(function(){addLayer("routesfromvalledupar",!1,routesLayer),addLayer("missinginfrastructure",!1,missingInfrastructureLayer),addLayer("isolines",!1,isolinesLayer),initRangeSlider(),d3.queue().defer(d3.json,"../../data/"+app.config.data.places).await(function(e,t){if(e)throw e;places_aoi=t,mapDraw(places_aoi)})})}})}function hideSplashScreen(){$("#loader").removeClass("show"),setTimeout(function(){$("#loader").removeClass("displayed")},1e3)}function mapDraw(e){mapboxgl.accessToken=app.config.accessToken;var t="dark"===app.config.theme?"mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t":"mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi";map=new mapboxgl.Map({container:"map",style:t,zoom:app.config.map.zoom,center:app.config.map.center}),map.dragRotate.disable(),map.touchZoomRotate.disableRotation(),map.keyboard.disable(),map.boxZoom.disable(),config.tabletop,$(document).keydown(function(e){e.ctrlKey!==!0||"61"!==e.which&&"107"!==e.which&&"173"!==e.which&&"109"!==e.which&&"187"!==e.which&&"189"!==e.which||e.preventDefault()}),$(window).bind("mousewheel DOMMouseScroll",function(e){e.ctrlKey===!0&&e.preventDefault()}),map.on("viewreset",update),map.on("moveend",update),map.on("move",update),map.on("load",hideSplashScreen),svg=d3.select(map.getCanvasContainer()).append("svg").attr("id","map-features"),lineFunction=d3.svg.line().x(function(e){return project(e).x}).y(function(e){return project(e).y}).interpolate("linear");for(var i in app.layers)app.layers.hasOwnProperty(i)&&app.layers[i].layer.init(svg,e);labelLayer=svg.append("g").attr("id","label-layer"),labelLayer.selectAll("g").data(places_aoi.features).enter().append("g").attr("class","").attr("data-id",function(e){return e.properties.osm_id}).each(function(){var e=d3.select(this),t=e.append("text");t.append("tspan").attr("class","title").text(function(e){return e.properties.name}).style("opactity",0).attr("class","title").attr("x","-4").attr("y","45"),t.append("tspan").attr("class","desc").text(" m to street").attr("x","-4").attr("y","45").attr("dy","1.2em"),app.config.layoutdebug===!0&&e.append("rect").attr("class","layoutdebug")}),settlementPointLayer=svg.append("g").attr("id","settlement-point-layer"),settlementPointLayer.selectAll("circle").data(places_aoi.features).enter().append("circle").attr("class",function(e){return"village "+e.properties.type}).attr("r",function(e){return app.config.circleRadius+getPopulationFactor(e.properties)}).on("click",function(e){onSettlementClicked(e)}).attr("data-id",function(e){return e.properties.osm_id}).each(function(e){app.villagePositionsMap[e.properties.osm_id]={},app.villagePositionsMap[e.properties.osm_id].x=project(e.geometry.coordinates).x,app.villagePositionsMap[e.properties.osm_id].y=project(e.geometry.coordinates).y}),settlementPointLayer.moveToFront(),update(0),initMapLayersControl()}function initMapLayersControl(){app.config.showIsolines=$("#show-isolines").is(":checked"),app.config.showIsolines||($legend.find(".legend-item .graphic-isoline").addClass("hide"),d3.selectAll("g#isolines").classed("hide",!0),$infoBox.find("#reachability").hide()),$("#show-isolines").click(function(){$(this).is(":checked")?($legend.find(".legend-item .graphic-isoline").removeClass("hide"),d3.selectAll("g#isolines").classed("hide",!1),$infoBox.find("#reachability").show()):($legend.find(".legend-item .graphic-isoline").addClass("hide"),d3.selectAll("g#isolines").classed("hide",!0),$infoBox.find("#reachability").hide())})}function update(e){null!==e&&"object"==typeof e?e=0:isNaN(e)&&(e=app.config.transitionTime),app.layout=calculateLayoutVars(),settlementPointLayer.selectAll("circle").each(function(e){app.villagePositionsMap[e.properties.osm_id]={},app.villagePositionsMap[e.properties.osm_id].x=project(e.geometry.coordinates).x,app.villagePositionsMap[e.properties.osm_id].y=project(e.geometry.coordinates).y});for(var t in app.layers)app.layers.hasOwnProperty(t)&&app.layers[t].layer.calc();"smallmultiples"!==app.view&&(app.villagePositions=app.villagePositionsMap.slice()),updateSettlementPointLayer(e);for(t in app.layers)app.layers.hasOwnProperty(t)&&app.layers[t].layer.render(e);renderLabels(e)}function toggleViews(){"smallmultiples"===app.view?triggerMapView():triggerSmallMultiplesView()}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!0),showMap(),enableMapInteraction(),$legend.removeClass("hide"),app.view="",update(app.config.transitionTime)}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),d3.selectAll("#orderby").classed("disabled",!1),hideMap(),disableMapInteraction(),$legend.addClass("hide"),app.view="smallmultiples",update(app.config.transitionTime)}function reorderSmallMultiples(e){app.orderby=e,d3.selectAll(".orderby").classed("active",!1),d3.selectAll("."+app.orderby).classed("active",!0),update(app.config.transitionTime)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}function enableMapInteraction(){map.doubleClickZoom.enable(),map.scrollZoom.enable(),map.dragPan.enable(),d3.select("#map").classed("disabled",!1)}function disableMapInteraction(){map.doubleClickZoom.disable(),map.scrollZoom.disable(),map.dragPan.disable(),d3.select("#map").classed("disabled",!0)}function showMap(){d3.selectAll(".mapboxgl-canvas").classed("hidden",!1),d3.selectAll(".mapboxgl-canvas").classed("hidden",!1)}function hideMap(){d3.selectAll(".mapboxgl-canvas").classed("hidden",!0),d3.selectAll(".mapboxgl-canvas").classed("hidden",!0)}function updateSettlementPointLayer(e){settlementPointLayer.selectAll("circle").each(function(){var t=d3.select(this),i=t.attr("data-id");isDefined(app.villagePositions[i])&&t.transition().duration(e).attr("cx",app.villagePositions[i].x).attr("cy",app.villagePositions[i].y)})}function renderLabels(e){"smallmultiples"===app.view?labelLayer.transition().duration(e).style("opacity",1):labelLayer.transition().duration(e).style("opacity",0),repositionLabels(e)}function repositionLabels(e){labelLayer.selectAll("g").each(function(){var t=d3.select(this),i=t.attr("data-id");t.transition().duration(e).style("opacity",1).attr("transform",function(){return"translate("+app.villagePositions[i].x+","+app.villagePositions[i].y+")"})})}function calculateLayoutVars(){var e={};e.w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),e.h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),e.rows=7,e.cols=6,$nav.length>0?e.navWidth=Math.round($nav.width()):$("#nav").length>0?e.navWidth=Math.round($("#nav").width()):$pageTitle.length>0?e.navWidth=Math.round($pageTitle.outerWidth(!0)):e.navWidth=Math.round($("#page-title").outerWidth(!0)),0==$legend.length&&($legend=$("#legend")),e.legendWidth=Math.round($legend.width()),0==$infoBox.length&&($infoBox=$("#info"));var t=$infoBox.hasClass("show");return e.infoHeight=Math.round(parseInt($infoBox.height(),10)),t||($infoBox.css("bottom",-e.infoHeight+"px"),e.infoHeight=0),e.offsetLeft=e.navWidth+60,e.offsetTop=Math.round(.01*e.w),e.offsetBottom=Math.round(e.offsetTop+e.infoHeight),e.offsetRight=0,e.gapX=Math.round(.008*e.w),e.gapY=Math.round(e.gapX),e.widthperelement=Math.round((e.w-e.offsetLeft-e.offsetRight-(e.cols-1)*e.gapX)/e.cols),e.heightperelement=Math.round((e.h-e.offsetTop-e.offsetBottom-(e.rows-1)*e.gapY)/e.rows),e}function project(e){return map.project(new mapboxgl.LngLat(+e[0],+e[1]))}function projectPoint(e,t){var i=map.project(new mapboxgl.LngLat(e,t));this.stream.point(i.x,i.y)}function isDefined(e){return"undefined"!=typeof e&&null!==e}function initRangeSlider(){$rangeSlider=$("#range__slider"),$rangeText=$("#range__text");var e=parseInt($rangeSlider.val());$rangeText.html(e+" min"),app.layers.isolines.layer.setRange(e);for(var t=parseInt($rangeSlider.attr("min")),i=parseInt($rangeSlider.attr("max")),a=parseInt($rangeSlider.attr("step")),s=1+(i-t)/a,o=[],n=0;n<s;n++)o.push(t+n*a);app.layers.isolines.layer.setQueryRanges(o.toString())}function rangeSliderInput(){var e=parseInt($rangeSlider.val());$rangeText.html(e+" min"),app.layers.isolines.layer.setRange(e),app.layers.isolines.layer.toggleIsolines()}function showInfoBox(e){$infoBox||($infoBox=$("#info"));var t=e.properties.type;"Vda-Resguardo Caño Padilla"!=e.properties.name&&"Resguardo indígena La Laguna"!=e.properties.name||(t="indigenous reserve"),$infoBox.find("#basic-info .title").text(e.properties.name),$infoBox.find("#basic-info .details").text(String(t).capitalize()+", "+getPlacePopulation(e.properties)+" inhabitants"),drawMicrovis(e),$legend.find(".legend-item.isolines").removeClass("hide"),$legend.find(".legend-item.threat").removeClass("hide");var i=app.layers.isolines.layer.hasIsolines(e.properties.osm_id);i?($infoBox.find("#reachability .isolines-wrap").removeClass("hide"),$infoBox.find("#reachability .no-reachable").addClass("hide")):($infoBox.find("#reachability .isolines-wrap").addClass("hide"),$infoBox.find("#reachability .no-reachable").removeClass("hide")),$infoBox.addClass("show"),$infoBox.find(".close").one("click",function(){hideInfoBox(),hideFOS("route"),deactivateSelectedSettlements(),$legend.find(".legend-item.isolines").addClass("hide"),$legend.find(".legend-item.threat").addClass("hide")})}function hideInfoBox(e){$infoBox||($infoBox=$("#info")),$infoBox.removeClass("show")}function drawMicrovis(e){d3.selectAll("#microvis svg").remove();var t="<span>"+activeRouteObj.route.distance/1e3+" km,</span> <span class='time'>"+parseInt(activeRouteObj.route.travelTime/60)+" min</span>";if(activeMissingObj){var i=activeMissingObj.missing.properties.distance/1e3;i=Math.round(10*i)/10,t+=" till the end of the road | <span class='no-reachable'>"+i+" km</span> from road to settlement"}else t+=" to the settlement";$infoBox.find("#microvis-route-stats").html(t),drawElevationProfile(e,activeRouteObj,activeMissingObj)}function drawElevationProfile(e,t,i){function a(){currentLine.style("visibility","visible"),currentCircle.style("visibility","visible"),currentText.style("visibility","visible")}function s(){var e=d3.mouse(this),t=e[0],i=Math.round(xElev.invert(t));i<0&&(i=0),i>=p.length&&(i=p.length-1);var a=10*i/1e3,s=Math.round(p[i].properties.elevation);currentLine.attr("x1",xElev(i)).attr("y1",yElev(0)).attr("x2",xElev(i)).attr("y2",yElev(s)),currentCircle.attr("cx",xElev(i)).attr("cy",yElev(s)),currentTextPlace.attr("x",xElev(i)-2).attr("y",yElev(s)-22).text(function(){return"Dist: "+a+" km"}),currentTextElev.attr("x",xElev(i)-2).attr("y",yElev(s)-12).text(function(){return"Elev: "+s+" m"})}function o(e,t){currentLine.style("visibility","hidden"),currentCircle.style("visibility","hidden"),currentText.style("visibility","hidden")}function n(){microvisWidth=parseInt(d3.select("#info #microvis").style("width"),10),microvisHeight=parseInt(d3.select("#info .content").style("height"),10)-80,graphWidth=microvisWidth-margin.left-margin.right,graphHeight=microvisHeight-margin.top-margin.bottom,xElev.range([0,graphWidth]),yElev.range([graphHeight,0]),svgElev.attr("width",microvisWidth),svgElev.attr("height",microvisHeight),svgElev.select(".profile.route").attr("d",profilePath(l)),svgElev.select(".profile.missing").attr("d",profilePath(r)).attr("transform","translate("+xElev(l.length)+",0)"),svgElev.select("rect.hit").attr("width",graphWidth).attr("height",graphHeight),yElevAxis.tickSize(-graphWidth),svgElev.select(".x.axis").attr("transform","translate("+margin.left+","+(graphHeight+margin.top)+")").call(xElevAxis),svgElev.select(".y.axis").call(yElevAxis)}microvisWidth=parseInt(d3.select("#info #microvis").style("width"),10),microvisHeight=parseInt(d3.select("#info .content").style("height"),10)-80,graphWidth=microvisWidth-margin.left-margin.right,graphHeight=microvisHeight-margin.top-margin.bottom;var l=t.route_sliced.features,r=i?i.missing_sliced.features:[],p=l.concat(r);xElev=d3.scale.linear().range([0,graphWidth]).domain([0,maxDistance/10]),yElev=d3.scale.linear().range([graphHeight,0]).domain([0,maxElev]),yElevAxis=d3.svg.axis().ticks(4).tickFormat(function(e){return e+"m"}).tickSize(-graphWidth).tickPadding(5).scale(yElev).orient("left"),xElevAxis=d3.svg.axis().ticks(5).tickFormat(function(e){return 10*e/1e3+"km"}).tickPadding(10).scale(xElev).orient("bottom"),profilePath=d3.svg.line().interpolate("basis").x(function(e,t){return xElev(t)}).y(function(e,t){return yElev(e.properties.elevation)}),svgElev=d3.select("#microvis-route-profile").append("svg").attr("class","elevation").attr("width",microvisWidth).attr("height",microvisHeight),svgElev.append("g").attr("class","axis y").attr("transform","translate("+margin.left+","+margin.top+")").call(yElevAxis),svgElev.append("g").attr("class","axis x").attr("transform","translate("+margin.left+","+(graphHeight+margin.top)+")").call(xElevAxis).selectAll("text").style("text-anchor","end"),gProfile=svgElev.append("g").attr("class","profile-group").attr("transform","translate("+margin.left+","+margin.top+")"),gProfile.append("path").attr("class","profile route").attr("d",profilePath(l)),gProfile.append("path").attr("class","profile missing").attr("d",profilePath(r)).attr("transform","translate("+xElev(l.length)+",0)"),currentLine=gProfile.append("line").attr("class","current").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",graphHeight).style("visibility","hidden"),currentCircle=gProfile.append("circle").attr("class","current").attr("cx",0).attr("cy",0).attr("r",2).style("visibility","hidden"),currentText=gProfile.append("g").attr("class","current-text").style("visibility","hidden"),currentTextPlace=currentText.append("text"),currentTextElev=currentText.append("text").attr("class","sec"),gProfile.append("rect").attr("class","hit").attr("width",graphWidth).attr("height",graphHeight).on("mouseenter",a).on("mousemove",s).on("mouseout",o),d3.select(window).on("resize",n)}function drawRoute(e,t){svgRoute=d3.select("#microvis-route").append("svg").attr("class","route"),svgRoute.append("g").append("path").attr("data-id",e.properties.osm_id).attr("class","line route").attr("d",lineFunction(t)),resizeRoute()}function resizeRoute(){var e=svgRoute.select("g"),t=e.node().getBBox(),i=app.layout.microvisWidth/t.width,a=-t.x*i,s=-t.y*i;svgRoute.attr("width",app.layout.microvisWidth).attr("height",i*t.height),e.attr("transform"," translate("+a+","+s+") scale("+i+")")}function loadFOSByLineString(e,t){console.log("load FOS by GeoJSON LineString"),console.log(app.config.apiBase+"/fos/route/"),console.log(e);var i={feature:JSON.stringify(e),buffer:config.threat.buffer,intersect:config.threat.intersect};$.ajax({method:"POST",url:app.config.apiBase+"/fos/route/",data:JSON.stringify(i),contentType:"application/json; charset=utf-8",dataType:"json",success:function(e){console.log("FOS loaded"),console.log(e),drawFOS(e,t)},error:function(e){console.log(JSON.stringify(e))}})}function hideFOS(e){map.getSource("fos-"+e)&&(map.setLayoutProperty("fos1-"+e,"visibility","none"),map.setLayoutProperty("fos2-"+e,"visibility","none"),map.setLayoutProperty("fos3-"+e,"visibility","none"))}function drawFOS(e,t){map.getSource("fos-"+t)?map.getSource("fos-"+t).setData(e):map.addSource("fos-"+t,{type:"geojson",data:e}),map.getLayer("fos1-"+t)?(map.setLayoutProperty("fos1-"+t,"visibility","visible"),map.setLayoutProperty("fos2-"+t,"visibility","visible"),map.setLayoutProperty("fos3-"+t,"visibility","visible")):(map.addLayer({id:"fos3-"+t,type:"fill",source:"fos-"+t,filter:["==","fos",3],paint:{"fill-color":"#F7D57F","fill-opacity":.8,"fill-antialias":!1}}),map.addLayer({id:"fos2-"+t,type:"fill",source:"fos-"+t,filter:["==","fos",2],paint:{"fill-color":"#F5A623","fill-opacity":.8,"fill-antialias":!1}}),map.addLayer({id:"fos1-"+t,type:"fill",source:"fos-"+t,filter:["==","fos",1],paint:{"fill-color":"#ED5D5A","fill-opacity":.8,"fill-antialias":!1}}))}function onSettlementClicked(e){if($.inArray(e.properties.osm_id,app.selectedSettlements)>=0)d3.selectAll(".village[data-id='"+e.properties.osm_id+"']").classed("selected",!1),d3.selectAll("g[data-id='"+e.properties.osm_id+"']").classed("selected-settlement",!1),app.selectedSettlements.remove(e.properties.osm_id),0==app.selectedSettlements.length&&svg.classed("detail",!1);else{app.config.multipleSettlements||deactivateSelectedSettlements(),d3.selectAll(".village[data-id='"+e.properties.osm_id+"']").classed("selected",!0),d3.selectAll("g[data-id='"+e.properties.osm_id+"']").classed("selected-settlement",!0);var t=d3.select("#routesfromvalledupar g[data-id='"+e.properties.osm_id+"']");t.moveToFront(),app.selectedSettlements.push(e.properties.osm_id),svg.classed("detail",!0),activeRouteObj=getElementByPlaceID(e.properties.osm_id,routesJSON.routes),activeMissingObj=getElementByPlaceID(e.properties.osm_id,routesJSON.missing),activeSettlementGeoJSON=getGeoJSONFeatureByPlaceID(e.properties.osm_id,places_aoi),activeRouteGeoJSON=getGeoJSONFeatureByPlaceID(e.properties.osm_id,routesGeoJSON),config.threat.show&&(hideFOS("route"),loadFOSByLineString(activeRouteGeoJSON,"route")),showInfoBox(e),$("#show-isolines").click(function(){$(this).is(":checked")?($legend.find(".legend-item .graphic-isoline").removeClass("hide"),d3.selectAll("g#isolines").classed("hide",!1),$infoBox.find("#reachability").show()):($legend.find(".legend-item .graphic-isoline").addClass("hide"),d3.selectAll("g#isolines").classed("hide",!0),$infoBox.find("#reachability").hide())});var i=turf.featureCollection([activeRouteGeoJSON,activeSettlementGeoJSON]),a=turf.bbox(i);map.fitBounds(a,{padding:{top:100,bottom:240,left:100,right:180}})}if(app.selectedSettlements.length>0){for(var s in app.layers)app.layers.hasOwnProperty(s)&&(app.layers[s].active=!1,d3.selectAll(".mode#"+s).classed("active",app.layers[s].active));app.layout=calculateLayoutVars(),update(app.config.transitionTime)}else{for(var s in app.layers)"routesfromvalledupar"!==s&&"missinginfrastructure"!==s||app.layers.hasOwnProperty(s)&&(app.layers[s].active=!0,d3.selectAll(".mode#"+s).classed("active",app.layers[s].active));app.layout=calculateLayoutVars(),hideInfoBox(e),hideFOS("route"),$legend.find(".legend-item.isolines").addClass("hide"),$legend.find(".legend-item.threat").addClass("hide"),update(app.config.transitionTime)}}function deactivateSelectedSettlements(){if(0==app.selectedSettlements.length)return!1;var e=app.selectedSettlements[0];d3.selectAll(".village[data-id='"+e+"']").classed("selected",!1),d3.selectAll("g[data-id='"+e+"']").classed("selected-settlement",!1),app.selectedSettlements.remove(e),0==app.selectedSettlements.length&&svg.classed("detail",!1)}var app={};app.view="",app.mode="",app.orderby="distance",app.layers=[],app.villagePositions=[],app.villagePositionsMap=[],app.selectedSettlements=[];var smpos=[],map,svg,settlementPointLayer,lineFunction,places_aoi,routesGeoJSON=turf.featureCollection([]),routesJSON={};routesJSON.routes=[],routesJSON.missing=[];var activeSettlementGeoJSON,activeRouteGeoJSON,activeRouteObj,activeMissingObj,$body,$nav,$pageTitle,$legend,$infoBox,$rangeSlider,$rangeText;$(document).ready(function(){$body=$("body"),$nav=$("#nav"),$pageTitle=$("#page-title"),$legend=$("#legend"),$infoBox=$("#info"),app.layout=calculateLayoutVars(),$.when($.getScript("config.js"),$.Deferred(function(e){$(e.resolve)})).done(function(){app.config=config,console.log("#################################################"),console.log("##  DIGENTI APP started. Loading requirements… ##"),console.log("#################################################"),console.log(" "),"undefined"==typeof app.config.theme&&(app.config.theme="light"),$body.addClass(app.config.theme),app.config.tabletop&&$body.addClass("tabletop"),"undefined"!=typeof app.config.noUI&&app.config.noUI===!0&&$body.addClass("no-ui"),console.log("Current config follows in next line:"),console.log(app),init()})});var maxElev=2600;maxDistance=6e4;var svgElev,gProfile,xElev,yElev,xElevAxis,yElevAxis,profilePath,margin={top:30,right:60,bottom:30,left:34},microvisWidth,microvisHeight,graphWidth,graphHeight,currentLine,currentCircle,currentText,currentTextPlace,currentTextElev,svgRoute;d3.selection.prototype.moveToFront=function(){return this.each(function(){this.parentNode.appendChild(this)})},Array.prototype.remove=function(){for(var e,t=arguments,i=t.length,a;i&&this.length;)for(e=t[--i];(a=this.indexOf(e))!==-1;)this.splice(a,1);return this};