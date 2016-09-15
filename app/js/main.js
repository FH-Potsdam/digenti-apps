/* global d3:true */
/* global mapboxgl:true */
/* global console:true */
/* global missingInfrastructureLayer:true */
/* global isolinesLayer:true */
/* global routesLayer:true */
/* exported projectPoint */
/* exported setMode */
/* exported routesArray */
/* exported toggleViews */
/* exported reorderSmallMultiples */




//////////
// Vars
//////////

var map;
var svg;
var settlementPointLayer;
var lineFunction;
var places_aoi, street_points_aoi;
var routesArray = [];
var routesJSON = {};
routesJSON.routes = [];

// app-array, holds state vars of the app
var app  = {};
app.view = "";
app.mode = "";
app.orderby = "size";
app.layout = calculateLayoutVars();
app.layers = [];
app.villagePositions = [];
app.villagePositionsMap = [];


/////////////
// onReady
/////////////



/**
 * Add a new layer to the app
 * @param {String} name
 * @param {Boolean} state
 * @param {Object} Blueprint
 */
function addLayer(name, state, Blueprint) {
    app.layers[name] = {};
    app.layers[name].active = state;
    app.layers[name].layer = new Blueprint();
}


$(document).ready(function() {

    // load config
    $.when(
        $.getScript( "config.js" ),
        $.Deferred(function(deferred) { $(deferred.resolve); })
    // all scripts loaded
    ).done(function() {

        // add config from config.js to app array
        app.config = config;

        // Hello DIGENTI APP!
        console.log("DIGENTI APP started. Loading requirements…");

        // Set theme configured in config.js using body class
        if (typeof app.config.theme === 'undefined') app.config.theme = 'light';
        $('body').attr("class", app.config.theme);

        // app.config.theme = ($('body').hasClass('dark')) ? 'dark' : 'light';

        // Log the configuration for informational purposes
        console.log("Current config follows in next line:");
        console.log(app);

        // Init layer configuration and data load
        init();

    });

});




/**
 * initializes the app
 */
function init() {

    // Include scripts of layer modules
    $.when(
        $.getScript( "js/routesLayer.js" ),
        $.getScript( "js/missingInfrastructureLayer.js" ),
        $.getScript( "js/isolinesLayer.js" ),
        $.Deferred(function(deferred) { $(deferred.resolve); })
    // all scripts loaded
    ).done(function() {

        console.log("add layers");

        // add layers
        addLayer("routesfromvalledupar", false, routesLayer);
        addLayer("missinginfrastructure", false, missingInfrastructureLayer);
        addLayer("isolines", false, isolinesLayer);

        // Check slider
        rangeSliderInput();

        // Load json data
        d3.queue()
        	.defer(d3.json, '../../data/places_aoi.json')
            .defer(d3.json, '../../data/street_points_aoi.json')
            //.defer(d3.json, 'data/routes_cached.json')
            // all jsons are loaded
            .await(function(error, data1, data2) {

                // that shouldn't happen
                if (error) throw error;

                // push data from json in global vars
                places_aoi = data1;
                street_points_aoi = data2;

                // draw the map, finally
                mapDraw(places_aoi);

            });

    });

}


/**
 * hides the splash screen
 */
function hideSplashScreen() {
    // fade splash screen out
    $("#loader").removeClass("show");
    // hide the splash screen html element
    setTimeout(function() {
        $("#loader").removeClass("displayed");
    }, 1000);
}





function mapDraw(geojson) {

    // Our accessToken for the mapboxGL API
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';

    // select baseMap based on selected theme
    var baseMap = (app.config.theme === 'dark') ? 'mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t' : 'mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi';

    // Init new mapboxGL map
    map = new mapboxgl.Map({
        container: 'map',
        style: baseMap,
        zoom: 11,
        center: [-73.12, 10.410]
    });

    // add navigation control to our map
    map.addControl(new mapboxgl.Navigation());

    // add some event handlers to our map
    map.on("viewreset", update);
    map.on("moveend", update);
    map.on("move", update);
    map.on("load", hideSplashScreen);


    // Create d3 canvas on map canvas container. This will hold our visual elements
    svg = d3.select(map.getCanvasContainer()).append("svg").attr("class", "map-features");


    // This function generates a line object out of a set of points
    lineFunction = d3.svg.line()
                        .x(function(d) { return project(d).x; })
                        .y(function(d) { return project(d).y; })
                        .interpolate("linear");

    // Initialize the settlementPointLayer. It holds the circles of the settlements
    settlementPointLayer = svg.append("g").attr("id", "settlementPointLayer");

    // Binding the settlement data to our layer. Positions of the settlements are saved in app.villagePositionsMap-Array
    settlementPointLayer.selectAll("circle")
        .data(places_aoi.features)
        .enter()
        .append("circle")
            .attr("class", "village")
            .attr("r", app.config.circleRadius)
            .on("click", function(d) {
                var currentSettlement = d3.select(this);
                currentSettlement.classed("selected", !currentSettlement.classed("selected"));
                clickCallback(d);
            })
            .attr("data-id", function(d) { return d.properties.osm_id; })
            .each(function(d) {
                app.villagePositionsMap[d.properties.osm_id] = {};
                app.villagePositionsMap[d.properties.osm_id].x = project(d.geometry.coordinates).x;
                app.villagePositionsMap[d.properties.osm_id].y = project(d.geometry.coordinates).y;
            });

    // Initialize the Layers by calling their individual init functions
    for (var key in app.layers) {
        if (app.layers.hasOwnProperty(key)) {
            app.layers[key].layer.init(svg, geojson);
        }
    }

    // event handler for basemap_select-UI-Element
    $("#basemap_select").change(function() {
        switchBasemap($(this).val());
    });

    // Function to change the basemap
    function switchBasemap(layer) {
        if      (layer === 'DIGENTI')       { map.setStyle('mapbox://styles/jorditost/cipseaugm001ycunimvr00zea'); }
        else if (layer === 'DIGENTI-Light') { map.setStyle('mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi'); }
        else if (layer === 'DIGENTI-Dark')  { map.setStyle('mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t'); }
        else if (layer === 'fos-outdoor')   { map.setStyle('mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft'); }
        else                                { map.setStyle('mapbox://styles/mapbox/' + layer); }
    }


}





/**
 * updates the view of the app
 * @param {Number} transition_time
 */
function update(transition_time) {

    // Set transition time if it is undefined
    if (transition_time !== null && typeof transition_time === 'object') {
        // Function is called by map event handler
        // set transition_time to 0
        transition_time = 0;
    } else if (isNaN(transition_time)) {
        // function is called without transition_time
        // set transition_time to default value from config
        transition_time = app.config.transitionTime;
    }

    // Recalculate layout vars
    app.layout = calculateLayoutVars();

    // update the
    settlementPointLayer.selectAll("circle")
        .each(function(d) {
            app.villagePositionsMap[d.properties.osm_id] = {};
            app.villagePositionsMap[d.properties.osm_id].x = project(d.geometry.coordinates).x;
            app.villagePositionsMap[d.properties.osm_id].y = project(d.geometry.coordinates).y;
        });

    // calculating new views of the individual layers by calling their calc function
    for (var key in app.layers) {
        if (app.layers.hasOwnProperty(key)) {
            app.layers[key].layer.calc();
        }
    }

    // update settlementPointLayer to reanrange the settlement circles
    updateSettlementPointLayer(transition_time);

    // rendering the layer views by calling each layers render function
    for (key in app.layers) {
        if (app.layers.hasOwnProperty(key)) {
            app.layers[key].layer.render(transition_time);
        }
    }

}



///////////////////
// TRIGGER VIEWS
///////////////////

function reorderSmallMultiples(ob) {
    app.orderby = ob;
    d3.selectAll(".orderby").classed("active", false);
    d3.selectAll("."+app.orderby).classed("active", true);
    update(app.config.transitionTime);
}



function setMode(mode) {

    app.mode = mode;

    var timeout = 0;
    if (app.view === "smallmultiples") { timeout = 500; }

    for (var key in app.layers) {
        if (app.layers.hasOwnProperty(key)) {
            if (mode === key) { app.layers[key].active = true; }
            else { app.layers[key].active = false; }
            app.layers[key].layer.setActive(app.layers[key].active);
            d3.selectAll(".mode."+key).classed("active", app.layers[key].active);
        }
    }

    // Mode specific GUI elements
    if (app.mode == 'isolines') {
        $('#isolines-ui').removeClass('disabled');
    } else {
        $('#isolines-ui').addClass('disabled');
    }

    update(app.config.transitionTime);
}

function toggleViews() {
    if (app.view === "smallmultiples") {
        triggerMapView();
    } else {
        triggerSmallMultiplesView();
    }
}

function triggerMapView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", true);

    showMap();
    enableMapInteraction();

    app.view = "";
    update(app.config.transitionTime);
}


function triggerSmallMultiplesView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".smallmultiplesview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", false);

    hideMap();
    disableMapInteraction();

    app.view = "smallmultiples";
    update(app.config.transitionTime);
}

//////////////////////
// Map Interactions
//////////////////////

function enableMapInteraction() {
    map.doubleClickZoom.enable();
    map.scrollZoom.enable();
    map.dragPan.enable();
    d3.select("#map").classed("disabled", false);
}

function disableMapInteraction() {
    map.doubleClickZoom.disable();
    map.scrollZoom.disable();
    map.dragPan.disable();
    d3.select("#map").classed("disabled", true);
}

function showMap() {

    d3.selectAll(".mapboxgl-canvas")
        .classed('hidden', false);

    d3.selectAll(".mapboxgl-canvas")
        .classed('hidden', false);

    // setMapOpacity(1);
    // enableMapInteraction();
}

function hideMap() {

    d3.selectAll(".mapboxgl-canvas")
        .classed('hidden', true);

    d3.selectAll(".mapboxgl-canvas")
        .classed('hidden', true);

    // setMapOpacity(0.08);
    // disableMapInteraction();
}

// function setMapOpacity(value) {
//
//     d3.selectAll(".mapboxgl-canvas")
//         .transition()
//         .duration(500)
//             .style("opacity", value);
//
//     d3.selectAll(".mapboxgl-control-container")
//         .transition()
//         .duration(500)
//             .style("opacity", value);
// }


function activateButtons() {
    d3.selectAll(".disabled")
        .attr("disabled", null);
}



function updateSettlementPointLayer(transition_time) {

    settlementPointLayer.moveToFront();

    settlementPointLayer.selectAll("circle").each(function() {

        var current_el = d3.select(this);
        var current_id = current_el.attr("data-id");

        if (isDefined(app.villagePositions[current_id])) {

            current_el
                .attr("opacity", "1")
                .transition()
                .duration(transition_time)
                    .attr("cx", app.villagePositions[current_id].x)
                    .attr("cy", app.villagePositions[current_id].y);
        }

    });

}






function calculateLayoutVars() {

    var layoutVars = {};

    // width and height of viewport
    layoutVars.w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    layoutVars.h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    // number of rows and cols
    layoutVars.rows = 7;
    layoutVars.cols = 6;

    // width of navigation bar at left side of the viewport
    layoutVars.navWidth = Math.round($("#nav").width());
    layoutVars.infoWidth = Math.round(parseInt($("#info").width()) + parseInt($("#info").css('right')));

    // calculate offset of small multiples from viewport
    layoutVars.offsetLeft = layoutVars.navWidth + 50;
    layoutVars.offsetTop = Math.round(layoutVars.w*0.01);
    layoutVars.offsetBottom = Math.round(layoutVars.offsetTop);
    layoutVars.offsetRight = Math.round(layoutVars.offsetTop + layoutVars.infoWidth);

    // caclulate gaps between single elements
    layoutVars.gapX = Math.round(layoutVars.w*0.008);
    layoutVars.gapY = Math.round(layoutVars.gapX);

    // calculate width and height for each element
    layoutVars.widthperelement = Math.round((layoutVars.w - layoutVars.offsetLeft - layoutVars.offsetRight - (layoutVars.cols-1)*layoutVars.gapX) / layoutVars.cols);
    layoutVars.heightperelement = Math.round((layoutVars.h - layoutVars.offsetTop - layoutVars.offsetBottom - (layoutVars.rows-1)*layoutVars.gapY) / layoutVars.rows);

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

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


function rangeSliderInput() {
    var range = parseInt($("#range__slider").val());
    $("#range__text").html(range + " min");

    // Set range in isolines layer
    app.layers['isolines'].layer.setRange(range);

    // Toggle isolines if isolines view is active
    if (app.layers['isolines'].active) {
        app.layers['isolines'].layer.toggleIsolines();
    }
}

// This callback is called when clicking on a location
function clickCallback(d) {

    var $infoBox = $("#info");

    // Get data
    $infoBox.find(".title").text(d.properties.name);
    // $infoBox.find(".description").html();
    $infoBox.find(".type").next('dd').text(String(d.properties.type).capitalize());
    $infoBox.find(".population").next('dd').text(getPlacePopulation(d.properties));
    $infoBox.find(".objectID").next('dd').text(d.properties.osm_id);

    // Show
    $infoBox.addClass("show");

    $infoBox.find(".close").one("click", function(e) {
        $("#info").removeClass("show");
    });

    app.layout = calculateLayoutVars();

}
