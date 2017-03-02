/*global d3:true */
/*global mapboxgl:true */
/*global turf:true */
/*global console:true */


/* #############
        HERE CONFIG
   ############# */

var platform = new H.service.Platform({
  'app_id': 'EOg7UyuSFbPF0IG5ANjz',
  'app_code': 'iRnqNl0dyzX_8FOlchD0ZQ'
});

// Get an instance of the normal routing service:
var router = platform.getRoutingService();








/* #############
        VARS
   ############# */

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var lineFunction, map;
var routesArray = [];
var routesJSON = {};
routesJSON.routes = [];

// CONFIG ARRAY
var config  = {};
config.view = "";
config.layers = {};



$.getScript("test.js", function(data, textStatus, jqxhr) {

    config.layers.gsm = new routesLayer();

});







d3.json("../../data/places_aoi.json", function(err, data) {

    $.get("data/routes_cached.json")
        .done(function() {
            d3.json("data/routes_cached.json", function(error, data2) {
                routesJSON = data2;

                for (var i = 0; i<routesJSON.routes.length; i++) {
                    routesArray[routesJSON.routes[i].id] = routesJSON.routes[i].route
                }

                mapDraw(data);
            });
        })
        .fail(function() {
            mapDraw(data);
        });

});









function mapDraw(geojson) {

    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi',
        zoom: 11,
        center: [-73.02, 10.410]
    });

    map.addControl(new mapboxgl.Navigation());

    // Map functions
    map.on("viewreset", update);
    map.on("moveend", update);
    map.on("move", update);

    // d3 canvas
    var svg = d3.select(map.getCanvasContainer()).append("svg").attr("class", "map-features");

    //This is the accessor function we talked about above
    lineFunction = d3.svg.line()
                        .x(function(d) { return project(d).x; })
                        .y(function(d) { return project(d).y; })
                        .interpolate("linear");


    config.layers.gsm.init(svg, geojson);

    triggerMapView();

    // Inital Update to render Map
    update(500);

    var basemap_select = document.getElementById('basemap_select');
    var basemap_select_options = basemap_select.options;

    basemap_select.onchange = function() {
        var selectedValue = basemap_select_options[basemap_select.selectedIndex].value;
        switchLayer(selectedValue);
    };

    function switchLayer(layer) {
        if (layer === 'DIGENTI') {
            map.setStyle('mapbox://styles/jorditost/cipseaugm001ycunimvr00zea');
        } else if (layer === 'DIGENTI-Light') {
            map.setStyle('mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi');
        } else if (layer === 'DIGENTI-Dark') {
            map.setStyle('mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t');
        } else if (layer === 'fos-outdoor') {
            map.setStyle('mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft');
        } else {
            map.setStyle('mapbox://styles/mapbox/' + layer);
        }
    }


}



function update(transition_time) {
    config.layers.gsm.update(transition_time);
}










///////////////////
// TRIGGER VIEWS
///////////////////

function triggerMapView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", true);
    config.view = "";
    update(500);
}

function triggerSmallMultiplesView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".smallmultiplesview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", false);
    config.view = "smallmultiples";
    update(500);
}

function setMapOpacity(value) {

    d3.selectAll(".mapboxgl-canvas")
        .transition()
        .duration(500)
            .style("opacity", value);

    d3.selectAll(".mapboxgl-control-container")
        .transition()
        .duration(500)
            .style("opacity", value);
}


function activateButtons() {
    d3.selectAll(".disabled")
        .attr("disabled", null);
}








//////////////////////
// Map Interactions
//////////////////////

function enableMapInteraction() {
    map.scrollZoom.enable();
    map.dragPan.enable();
    d3.select("#map").classed("disabled", false);
}

function disableMapInteraction() {
    map.scrollZoom.disable();
    map.dragPan.disable();
    d3.select("#map").classed("disabled", true);
}






function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}
