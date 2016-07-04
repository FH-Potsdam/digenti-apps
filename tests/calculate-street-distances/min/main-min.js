function OpenInNewTab(t){var e=window.open(t,"_blank");e.focus()}function generateUniqueID(){return"id"+(new Date).getTime().toString()+Math.random().toString(36).substr(2,16)}function getRandomInt(t,e){return Math.floor(Math.random()*(e-t))+t}function transformHEREgeometry(t){for(var e=0;e<t.length;e++){t[e]=t[e].split(",");for(var a=0;a<t[e].length;a++)t[e][a]=parseFloat(t[e][a]);var n=t[e][0];t[e][0]=t[e][1],t[e][1]=n}return t}function getGEOJSON(t){var e=JSON.stringify(t);OpenInNewTab("data:text/plain;charset=utf-8,"+encodeURIComponent(e))}function mapDraw(t){function e(t){"DIGENTI"===t?map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea"):"fos-outdoor"===t?map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft"):map.setStyle("mapbox://styles/mapbox/"+t)}mapboxgl.accessToken="pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A",map=new mapboxgl.Map({container:"map",style:"mapbox://styles/jorditost/cipseaugm001ycunimvr00zea",zoom:11,center:[-73.02,10.41]}),map.addControl(new mapboxgl.Navigation),map.on("style.load",function(){});var a=map.getCanvasContainer();svg=d3.select(a).append("svg").attr("class","map-features"),featureElement=svg.append("g").attr("class","villages").selectAll("g").data(t.features).enter().append("g").attr("class","village-group").append("circle").attr({r:8}).attr("class","village").attr("data-id",function(){return generateUniqueID()}).on("click",function(){d3.select(this).classed("selected",!0);var t=d3.select(this).attr("data-id")}),map.on("viewreset",update),map.on("movestart",function(){}),map.on("moveend",function(){update(0)}),update(0),isolineAll(),triggerMapDistancesView();var n=document.getElementById("basemap_select"),r=n.options;n.onchange=function(){var t=r[n.selectedIndex].value;e(t)}}function getIsoline(t,e,a){var n,r={type:"Feature",properties:{"marker-color":"#f00"},geometry:{type:"Point",coordinates:t}},o=turf.nearest(r,street_points_aoi),i=turf.distance(r,o,"kilometers");n=.2>i?{touches_street:!0,distance_to_street:1e3*i,nearest_point:o.geometry.coordinates}:{touches_street:!1,distance_to_street:1e3*i,nearest_point:o.geometry.coordinates},a.properties.connections=n,places_aoi_street_distance.features.push(a),places_aoi_street_distance.features.length===places_aoi.features.length&&(activateButtons(),places_aoi_street_distance.features.sort(function(t,e){return d3.ascending(t.properties.name,e.properties.name)}),svg.selectAll(".village").data(places_aoi_street_distance.features).attr("data-distance_to_street",function(t){return t.properties.connections.distance_to_street}).attr("data-touches_street",function(t){return t.properties.connections.touches_street}).enter(),svg.selectAll(".village-group").each(function(t){var e=d3.select(this);e.append("line"),e.append("circle").attr({r:4}).attr("class","road"),e.append("text").text(t.properties.name).style("font-weight","bold").attr("y","30"),e.append("text").text("Distance to Street: "+Math.round(t.properties.connections.distance_to_street)+" meter").attr("y","45")}),update(0))}function update(t){if(w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),"smallmultiples"===view){for(var e=0,a=0,n=7,r=6,o=.8*w/(r+1),i=h/(n+1),s=[],c=0;c<places_aoi_street_distance.features.length;c++)s.push(places_aoi_street_distance.features[c].properties.connections.distance_to_street);var l=Math.max.apply(null,s),p=.8*o/(2*l);svg.selectAll(".village-group").each(function(s){var c=d3.select(this);c.transition().duration(t).style("opacity",1).attr("transform",function(){var t=.2*w+e*o+o/2,n=a*i+i;return"translate("+t+","+n+")"}),c.select(".village").transition().duration(t).attr("cx",function(){var t=8;return s.properties.connections.distance_to_street>0&&(t=2*p*s.properties.connections.distance_to_street),t}),c.select(".road").transition().duration(t).style("opacity",1).attr("cy",0).attr("cx",function(){var t=8;return s.properties.connections.distance_to_street>0&&(t=0),t}),c.select("line").transition().duration(t).attr("x1",0).attr("y1",0).attr("x2",2*p*s.properties.connections.distance_to_street).attr("y2",0),c.selectAll("text").attr("x",0).transition().duration(500).style("opacity",1),setMapOpacity(0),e++,e===r&&(e=0),a++,a===n&&(a=0)})}else"map_distances"===view?svg.selectAll(".village-group").each(function(e){var a=d3.select(this),n=project(e.geometry.coordinates).x,r=project(e.geometry.coordinates).y,o=project(e.properties.connections.nearest_point).x-n,i=project(e.properties.connections.nearest_point).y-r;a.transition().duration(t).style("opacity",.4).attr("transform",function(){return"translate("+n+","+r+")"}),a.select(".village").transition().duration(t).attr("cx",function(){return 0}),a.select(".road").transition().duration(t).style("opacity",1).attr("cx",o).attr("cy",i),a.select("line").transition().duration(t).attr("x1",0).attr("y1",0).attr("x2",o).attr("y2",i),a.selectAll("text").transition().duration(t).style("opacity",0),setMapOpacity(1)}):svg.selectAll(".village-group").each(function(e){var a=d3.select(this),n=project(e.geometry.coordinates).x,r=project(e.geometry.coordinates).y;a.transition().duration(t).style("opacity",.4).attr("transform",function(){return"translate("+n+","+r+")"}),a.select(".village").transition().duration(t).attr("cx",function(){return 0}),a.select(".road").transition().duration(t).style("opacity",0),a.select("line").transition().duration(t).attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",0),a.selectAll("text").transition().duration(t).style("opacity",0),setMapOpacity(1)});console.log("UPDATE")}function project(t){return map.project(new mapboxgl.LngLat(+t[0],+t[1]))}function isolineAll(){for(var t=0;t<places_aoi.features.length;t++){var e=places_aoi.features[t];getIsoline(e.geometry.coordinates,e.properties.osm_id,e)}}function triggerSmallMultiplesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".smallmultiplesview").classed("active",!0),view="smallmultiples",update(500)}function triggerMapView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapview").classed("active",!0),view="",update(500)}function triggerMapDistancesView(){d3.selectAll(".view").classed("active",!1),d3.selectAll(".mapdistancesview").classed("active",!0),view="map_distances",update(500)}function setMapOpacity(t){d3.selectAll(".mapboxgl-canvas").transition().duration(500).style("opacity",t),d3.selectAll(".mapboxgl-control-container").transition().duration(500).style("opacity",t)}function activateButtons(){d3.selectAll(".disabled").attr("disabled",null)}Array.prototype.equals&&console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."),Array.prototype.equals=function(t){if(!t)return!1;if(this.length!=t.length)return!1;for(var e=0,a=this.length;a>e;e++)if(this[e]instanceof Array&&t[e]instanceof Array){if(!this[e].equals(t[e]))return!1}else if(this[e]!==t[e])return!1;return!0},Object.defineProperty(Array.prototype,"equals",{enumerable:!1});var w=Math.max(document.documentElement.clientWidth,window.innerWidth||0),h=Math.max(document.documentElement.clientHeight,window.innerHeight||0),map,featureElement,svg,view="",places_aoi,street_points_aoi,places_aoi_street_distance={type:"FeatureCollection",crs:{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}},features:[]};d3.json("../../data/places_aoi.json",function(t,e){places_aoi=e,d3.json("../../data/street_points_aoi.json",function(t,e){street_points_aoi=e,mapDraw(places_aoi)})});