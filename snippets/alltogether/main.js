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

var layoutdebug = false;
var map;
var svg;
var settlementPointLayer;
var lineFunction;
var places_aoi, street_points_aoi;
var routesArray = [];
var routesJSON = {};
routesJSON.routes = [];

// CONFIG ARRAY
var config  = {};
config.view = "";
config.mode = "";
config.orderby = "size";

config.layout = {};

config.circleRadius = 5;

config.layers = {};




$.getScript("js/routesLayer.js", function(data, textStatus, jqxhr) {

    config.layers.gsm = new routesLayer();

    $.getScript("js/missingInfrastructureLayer.js", function(data, textStatus, jqxhr) {

        config.layers.missingInfrastructure = new missingInfrastructureLayer();

        $.getScript("js/isolinesLayer.js", function(data, textStatus, jqxhr) {

            config.layers.isolines = new isolinesLayer();

            d3.json("../../data/places_aoi.json", function(err, data) {

                places_aoi = data;

                d3.json("../../data/street_points_aoi.json", function(err, data2) {

                    street_points_aoi = data2;
                    //console.log(street_points_aoi);

                    $.get("data/routes_cached.json")
                        .done(function() {
                            d3.json("data/routes_cached.json", function(error, data3) {
                                routesJSON = data3;

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

            });

        });

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

    map.on("load", test456);

    function test456() {
        $("#loader").removeClass("show");
        setTimeout(function() {
            $("#loader").removeClass("displayed");
        }, 1000);
    }

    // d3 canvas
    svg = d3.select(map.getCanvasContainer()).append("svg").attr("class", "map-features");


    //This is the accessor function we talked about above
    lineFunction = d3.svg.line()
                        .x(function(d) { return project(d).x; })
                        .y(function(d) { return project(d).y; })
                        .interpolate("linear");

    settlementPointLayer = svg.append("g").attr("class", "settlementPointLayer").style("opacity", 0);

    settlementPointLayer.selectAll("circle")
        .data(places_aoi.features)
        .enter()
        .append("circle")
            .attr("fill", "green")
            .attr("r", config.circleRadius)
            .attr("data-id", function(d) { return d.properties.osm_id; });

    // Initialize the Layers
    config.layers.gsm.init(svg, geojson);
    config.layers.missingInfrastructure.init(svg, geojson);
    config.layers.isolines.init(svg, geojson);

    triggerMapView();
    setMode("missinginfrastructure");

    // Inital Update to render Map
    update(0);



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

    // Set transition time if it is undefined
    if (isNaN(transition_time)) { transition_time = 0; }

    config.layout = calculateLayoutVars();

    config.layers.gsm.update(transition_time);
    config.layers.missingInfrastructure.update(transition_time);
    config.layers.isolines.update(transition_time);

    updateSettlementPointLayer();

}








///////////////////
// TRIGGER VIEWS
///////////////////

function reorderSmallMultiples(ob) {
    config.orderby = ob;
    d3.selectAll(".orderby").classed("active", false);
    d3.selectAll("."+config.orderby).classed("active", true);
    update(500);
}

function setMode(mode) {

    config.mode = mode;
    console.log("Set Mode: "+config.mode);

    settlementPointLayer
        //.transition()
        //.duration(500)
            .style("opacity", 1);

    d3.selectAll(".mode").classed("active", false);

    if (config.mode === "missinginfrastructure") {
        d3.selectAll(".mode.missinginfrastructure").classed("active", true);
        config.layers.missingInfrastructure.setActive(true);
        config.layers.gsm.setActive(false);
        config.layers.isolines.setActive(false);
        update(500);
    } else if (config.mode === "routesfromvalledupar") {
        d3.selectAll(".mode.routesfromvalledupar").classed("active", true);
        config.layers.missingInfrastructure.setActive(false);
        config.layers.gsm.setActive(true);
        config.layers.isolines.setActive(false);
        update(500);
    } else if (config.mode === "isolines") {
        d3.selectAll(".mode.isolines").classed("active", true);
        config.layers.missingInfrastructure.setActive(false);
        config.layers.gsm.setActive(false);
        config.layers.isolines.setActive(true);
        update(500);
    }

    settlementPointLayer
        //.transition()
        //.duration(500)
            .style("opacity", 0);

}

function triggerMapView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", true);

    enableMapInteraction();

    config.view = "";
    update(500);
}

function triggerMapDistancesView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapdistancesview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", true);

    enableMapInteraction();

    config.view = "map-distances";
    update(500);
}

function triggerSmallMultiplesView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".smallmultiplesview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", false);

    disableMapInteraction();

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








function updateSettlementPointLayer() {

    if (config.mode === "isolines") {
        test123(config.layers.isolines.bcr)
    } else if (config.mode === "routesfromvalledupar") {
        test123(config.layers.gsm.bcr);
    } else if (config.mode === "missinginfrastructure") {
        test123(config.layers.missingInfrastructure.bcr);
    }

}

function test123(bcr) {

    if (isDefined(bcr)) {

        settlementPointLayer.selectAll("circle")
            .each(function() {
                var current_el = d3.select(this);
                var current_id = current_el.attr("data-id");
                if (isDefined(bcr[current_id])) {
                    current_el
                        .transition()
                        .duration(500)
                            .attr("cx", bcr[current_id].left+config.circleRadius)
                            .attr("cy", bcr[current_id].top+config.circleRadius);
                }
            });


    }

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







function selectSettlement(id) {
    console.log(id);
    $( "p.objectID" ).html( id );
}


function calculateLayoutVars() {

    var layoutVars = {};
    layoutVars.w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    layoutVars.h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    layoutVars.rows = 7;
    layoutVars.cols = 6;
    layoutVars.gap_hor = (layoutVars.w*0.8)/(layoutVars.cols+1);
    layoutVars.gap_ver = (layoutVars.h)/(layoutVars.rows+1);
    layoutVars.offsetLeft = layoutVars.w*0.25;
    layoutVars.offsetRight = 30;
    layoutVars.offsetTop = layoutVars.h*0.1;
    layoutVars.offsetBottom = 30;
    layoutVars.gapX = 15;
    layoutVars.gapY = 10;

    return layoutVars;

}



function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}

function projectPoint(lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    this.stream.point(point.x, point.y);
}


function isDefined(v) {
    return (typeof v !== 'undefined' && v !== null);
}
