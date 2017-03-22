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
/* exported repositionLabels */


//////////////
// App Vars
//////////////

// app-array, holds state vars of the app
var app  = {};
app.view = "";
app.mode = "";
app.orderby = "size";
// app.layout = calculateLayoutVars(); // After jQuery on ready
app.layers = [];
app.villagePositions = [];
app.villagePositionsMap = [];
app.selectedSettlements = [];

var smpos = [];


///////////////////
// Map / d3 vars
///////////////////

var map;
var svg;
var settlementPointLayer;
var lineFunction;


///////////////////
// Data vars
///////////////////

var places_aoi;
// var routesArray = [];

// Global array with all GeoJSON routes, as they are returned from the API
var routesGeoJSON = turf.featureCollection([]);

// Global routes JSON
var routesJSON = {};
routesJSON.routes = [];
routesJSON.missing = [];

// Active elements
var routeGeoJSON, activeRouteObj, activeMissingObj;


//////////////////
// DOM Elements
//////////////////

var $body,
    $nav,
    $infoBox,
    $rangeSlider,
    $rangeText;


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


/////////////
// onReady
/////////////

$(document).ready(function() {

    // Init DOM Elements
    $body = $('body');
    $nav = $("#nav");
    $infoBox = $("#info");

    // Calculate layout vars
    app.layout = calculateLayoutVars();

    // load config
    $.when(
        $.getScript("config.js"),
        $.Deferred(function(deferred) { $(deferred.resolve); })
    // all scripts loaded
    ).done(function() {

        // add config from config.js to app array
        app.config = config;

        // Hello DIGENTI APP!
        console.log("#################################################");
        console.log("##  DIGENTI APP started. Loading requirements… ##");
        console.log("#################################################");
        console.log(" ");

        // Set theme configured in config.js using body class
        if (typeof app.config.theme === 'undefined') app.config.theme = 'light';
        $body.addClass(app.config.theme);

        // Is tabletop
        if (app.config.tabletop) {
            $body.addClass('tabletop');
        }

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

    $.ajax({
        url: app.config.apiBase,
        type:'HEAD',
        error: function() {

            // API is not availabe -> abort

            $(".spinner").remove();
            $(".alert").html("Can't reach API under <i>" + app.config.apiBase + "</i>. It seems to be offline.<br>Please start the API and reload the app.");

        },
        success: function() {

            // API is availabel -> go on

            // Include scripts of layer modules
            $.when(
                $.getScript( "js/routesLayer.js" ),
                $.getScript( "js/missingInfrastructureLayer.js" ),
                $.getScript( "js/isolinesLayer.js" ),
                $.Deferred(function(deferred) { $(deferred.resolve); })
            // all scripts loaded
            ).done(function() {

                // add layers
                addLayer("routesfromvalledupar", false, routesLayer);
                addLayer("missinginfrastructure", false, missingInfrastructureLayer);
                addLayer("isolines", false, isolinesLayer);

                // Check slider
                initRangeSlider();
                // rangeSliderInput();

                // Load json data
                d3.queue()
                	.defer(d3.json, '../../data/' + app.config.data.places)
                	// .defer(d3.json, '../../data/places_aoi_dane.json')
                    // .defer(d3.json, '../../data/street_points_aoi.json')
                    // all jsons are loaded
                    .await(function(error, data1) {

                        // that shouldn't happen
                        if (error) throw error;

                        // push data from json in global vars
                        places_aoi = data1;

                        // draw the map, finally
                        mapDraw(places_aoi);
                    });
            });

        }
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


/**
 * Draw map
 */
function mapDraw(geojson) {

    // Our accessToken for the mapboxGL API
    mapboxgl.accessToken = app.config.accessToken;

    // select baseMap based on selected theme
    var baseMap = (app.config.theme === 'dark') ? 'mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t' : 'mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi';

    // Init new mapboxGL map
    map = new mapboxgl.Map({
        container: 'map',
        style: baseMap,
        zoom: app.config.map.zoom,
        // zoom: 11.4,
        center: app.config.map.center,
        // center: [-73.12, 10.410],
        // pitch: 45 // pitch in degrees
        // bearing: -60 // bearing in degrees

    });

    // Disable undesired interactions (for touch)
    map.dragRotate.disable();
    //map.touchZoomRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disable();
    map.boxZoom.disable();

    // disable right click
    if (config.tabletop) {
        //$(document).bind('contextmenu', function (e) { e.preventDefault(); });
    }

    // Disable Browser zoom
    $(document).keydown(function(event) {
        if (event.ctrlKey === true && (
                event.which === '61' ||
                event.which === '107' ||
                event.which === '173' ||
                event.which === '109'  ||
                event.which === '187'  ||
                event.which === '189'
            )) { event.preventDefault(); }
    });
    $(window).bind('mousewheel DOMMouseScroll', function (event) {
        if (event.ctrlKey === true) { event.preventDefault(); }
    });


    // add navigation control to our map
    map.addControl(new mapboxgl.Navigation());

    // add some event handlers to our map
    map.on("viewreset", update);
    map.on("moveend",   update);
    map.on("move",      update);
    map.on("load",      hideSplashScreen);


    // Create d3 canvas on map canvas container. This will hold our visual elements
    svg = d3.select(map.getCanvasContainer()).append("svg").attr("id", "map-features");


    // This function generates a line object out of a set of points
    lineFunction = d3.svg.line()
                        .x(function(d) { return project(d).x; })
                        .y(function(d) { return project(d).y; })
                        .interpolate("linear");



    // Initialize the labelLayer
    labelLayer = svg.append("g").attr("id", "label-layer");

    labelLayer.selectAll("g")
        .data(places_aoi.features)
        .enter()
        .append("g")
            .attr("class", "")
            .attr("data-id", function(d) { return d.properties.osm_id; })
            .each(function() {
                var current_el = d3.select(this);
                current_el.append("text").append("tspan")
                    .text(function(d) { return d.properties.name; })
                    .style("opactity", 0)
                    .attr("class", "title")
                    .attr("y", "132");

                if (app.config.layoutdebug === true) {
                    current_el.append("rect").attr("class", "layoutdebug");
                }
            });

    // Initialize the settlementPointLayer. It holds the circles of the settlements
    settlementPointLayer = svg.append("g").attr("id", "settlement-point-layer");

    // Binding the settlement data to our layer. Positions of the settlements are saved in app.villagePositionsMap-Array
    settlementPointLayer.selectAll("circle")
        .data(places_aoi.features)
        .enter()
        .append("circle")
            .attr("class", "village")
            .attr("r", function(d) { return app.config.circleRadius * getPopulationFactor(d.properties); })
            .on("click", function(d) {
                // var currentSettlement = d3.select(this);
                // currentSettlement.classed("selected", !currentSettlement.classed("selected")); // This is done inside onSettlementClicked(d) now
                onSettlementClicked(d);
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

    settlementPointLayer.moveToFront();

    // Function to change the basemap
    function switchBasemap(layer) {
        if      (layer === 'DIGENTI')       { map.setStyle('mapbox://styles/jorditost/cipseaugm001ycunimvr00zea'); }
        else if (layer === 'DIGENTI-Light') { map.setStyle('mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi'); }
        else if (layer === 'DIGENTI-Dark')  { map.setStyle('mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t'); }
        else if (layer === 'fos-outdoor')   { map.setStyle('mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft'); }
        else                                { map.setStyle('mapbox://styles/mapbox/' + layer); }
    }

    update(0);

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

    // Necessary to show villages when no mode is selected
    if (app.view !== "smallmultiples") {
        app.villagePositions = app.villagePositionsMap.slice();
    }

    // update settlementPointLayer to reanrange the settlement circles
    updateSettlementPointLayer(transition_time);

    // rendering the layer views by calling each layers render function
    for (key in app.layers) {
        if (app.layers.hasOwnProperty(key)) {
            app.layers[key].layer.render(transition_time);
        }
    }

    // Reposition the Labels
    renderLabels(transition_time);

}






///////////////////
// Views / Modes
///////////////////

// DEPRECATED
/*function setMode(mode) {

    if (app.mode === mode) {

        for (var key in app.layers) {
            if (app.layers.hasOwnProperty(key)) {
                app.layers[key].active = false;
                app.layers[key].layer.setActive(app.layers[key].active);
                d3.selectAll(".mode#"+key).classed("active", app.layers[key].active);
            }
        }

        update(app.config.transitionTime);

    } else {

        app.mode = mode;

        var timeout = 0;
        if (app.view === "smallmultiples") { timeout = 500; }

        for (var key in app.layers) {
            if (app.layers.hasOwnProperty(key)) {
                if (mode === key) { app.layers[key].active = true; }
                else { app.layers[key].active = false; }
                app.layers[key].layer.setActive(app.layers[key].active);
                d3.selectAll(".mode#"+key).classed("active", app.layers[key].active);
            }
        }

        // Mode specific GUI elements
        if (app.mode === 'isolines') {
            $('#reachability').removeClass('disabled');
        } else {
            $('#reachability').addClass('disabled');
        }

        update(app.config.transitionTime);

    }

}*/

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

function reorderSmallMultiples(ob) {
    app.orderby = ob;
    d3.selectAll(".orderby").classed("active", false);
    d3.selectAll("."+app.orderby).classed("active", true);
    update(app.config.transitionTime);
}

function activateButtons() {
    d3.selectAll(".disabled")
        .attr("disabled", null);
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
}

function hideMap() {

    d3.selectAll(".mapboxgl-canvas")
        .classed('hidden', true);

    d3.selectAll(".mapboxgl-canvas")
        .classed('hidden', true);
}


//////////////////////
// UPDATE Functions
//////////////////////

function updateSettlementPointLayer(transition_time) {

    settlementPointLayer.selectAll("circle").each(function() {

        var current_el = d3.select(this);
        var current_id = current_el.attr("data-id");

        if (isDefined(app.villagePositions[current_id])) {

            current_el
                .transition()
                .duration(transition_time)
                    .attr("cx", app.villagePositions[current_id].x)
                    .attr("cy", app.villagePositions[current_id].y);
        }
    });
}





function renderLabels(transition_time) {

    if (app.view === "smallmultiples") {
        labelLayer
            .transition()
            .duration(transition_time)
                .style("opacity", 1);
    } else {
        labelLayer
            .transition()
            .duration(transition_time)
                .style("opacity", 0);
    }

    //repositionLabels(transition_time);

}


function repositionLabels(transition_time) {

    labelLayer.selectAll("g").each(function() {

        var current_el = d3.select(this);
        var current_id = current_el.attr("data-id");

        current_el
            .transition()
            .duration(transition_time)
                .style("opacity", 1)
                .attr("transform", function() {
                    return "translate("+ smpos[current_id].x +","+ smpos[current_id].y +")";
                });

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
    if ($nav) {
        layoutVars.navWidth = Math.round($nav.width());
    } else {
        layoutVars.navWidth = Math.round($("#nav").width());
    }

    // Check info box
    if ($infoBox) { $infoBox = $("#info"); }
    var infoBoxVisible = $infoBox.hasClass("show");

    layoutVars.infoHeight = Math.round(parseInt($infoBox.height(), 10));

    if (!infoBoxVisible) {
        $infoBox.css("bottom", -layoutVars.infoHeight+"px");
        layoutVars.infoHeight = 0;
    }

    // layoutVars.infoWidth = Math.round(parseInt($infoBox.width()) + parseInt($infoBox.css('right')));
    // layoutVars.microvisWidth = parseInt($infoBox.find('#microvis').width());
    // layoutVars.microvisHeight = parseInt($infoBox.find('.content').height()) - 40;

    // calculate offset of small multiples from viewport
    layoutVars.offsetLeft = layoutVars.navWidth + 50;
    layoutVars.offsetTop = Math.round(layoutVars.w*0.01);
    layoutVars.offsetBottom = Math.round(layoutVars.offsetTop + layoutVars.infoHeight);
    layoutVars.offsetRight = Math.round(layoutVars.offsetTop);
    // layoutVars.offsetRight = Math.round(layoutVars.offsetTop + layoutVars.infoWidth);

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


/////////////////////////////
// Isolines' Range slider
/////////////////////////////

function initRangeSlider() {

    $rangeSlider = $("#range__slider");
    $rangeText = $("#range__text");

    // Default value
    var range = parseInt($rangeSlider.val());
    $rangeText.html(range + " min");

    // Set range in isolines layer
    app.layers['isolines'].layer.setRange(range);

    // Get all possible values
    var min = parseInt($rangeSlider.attr("min")),
        max = parseInt($rangeSlider.attr("max")),
        step = parseInt($rangeSlider.attr("step"));

    // console.log("range min: " + min);
    // console.log("range max: " + max);
    // console.log("range step: " + step);

    var numRanges = 1+((max-min)/step);
    // console.log("total ranges: " + numRanges);
    var rangesArray = [];
    for (var i=0; i<numRanges; i++) {
        rangesArray.push(min+(i*step));
    }

    app.layers['isolines'].layer.setQueryRanges(rangesArray.toString());
}

function rangeSliderInput() {

    var range = parseInt($rangeSlider.val());
    $rangeText.html(range + " min");
    // $infoBox.find("#reachability .details span").html(range + " min");

    // Set range in isolines layer
    app.layers['isolines'].layer.setRange(range);

    // Toggle isolines if isolines view is active
    app.layers['isolines'].layer.toggleIsolines();

}


//////////////
// Info Box
//////////////


function showInfoBox(d) {

    if (!$infoBox) $infoBox = $("#info");

    // Get data
    $infoBox.find("#basic-info .title").text(d.properties.name);
    $infoBox.find("#basic-info .details").text(String(d.properties.type).capitalize() + ", " + getPlacePopulation(d.properties) + " inhabitants")
    // $infoBox.find(".description").html();
    // $infoBox.find(".type").next('dd').text(String(d.properties.type).capitalize());
    // $infoBox.find(".population").next('dd').text(getPlacePopulation(d.properties));
    // $infoBox.find(".elevation").next('dd').text(parseInt(d.geometry.coordinates[2]) + "m");

    drawMicrovis(d);

    // Show item in legend
    $("#legend .legend-item.isolines").removeClass("hide");
    $("#legend .legend-item.threat").removeClass("hide");

    // Check isolines
    var hasIsolines = app.layers['isolines'].layer.hasIsolines(d.properties.osm_id);
    if (hasIsolines) {
        $infoBox.find("#reachability .isolines-wrap").removeClass("hide");
        $infoBox.find("#reachability .no-reachable").addClass("hide");
    } else {
        $infoBox.find("#reachability .isolines-wrap").addClass("hide");
        $infoBox.find("#reachability .no-reachable").removeClass("hide");
    }

    // Show
    $infoBox.addClass("show");

    $infoBox.find(".close").one("click", function() {
        hideInfoBox();
        hideFOS("route");
        deactivateSelectedSettlements();

        // Hide isolines item in legend
        $("#legend .legend-item.isolines").addClass("hide");
        $("#legend .legend-item.threat").addClass("hide");
    });
}


function hideInfoBox(d) {
    if (!$infoBox) $infoBox = $("#info");
    $infoBox.removeClass("show");
}


/////////////////////////////
// Draw Microvis Functions
/////////////////////////////

function drawMicrovis(d) {

    // Set the dimensions of the canvas / graph
    // microvis.width = parseInt($infoBox.find('.content').width());
    // app.layout.microvisHeight = 100;

    d3.selectAll("#microvis svg").remove();

    // This happens now in onSettlementClicked
    // // Get route data
    // var activeRouteObj = getElementByPlaceID(d.properties.osm_id, routesJSON.routes);
    // // routeData = routeJSON.route.geometry.coordinates;
    //
    // // Get missing profile
    // var activeMissingObj = getElementByPlaceID(d.properties.osm_id, routesJSON.missing);
    // // missingData = missingJSON.missing;

    // Add route stats
    $infoBox.find("#microvis-route-stats").empty().append(activeRouteObj.route.distance/1000 + " km | " + parseInt(activeRouteObj.route.travelTime/60) + " min");

    // Draw route
    // drawRoute(d, routeData);

    // Draw elevation profile
    drawElevationProfile(d, activeRouteObj, activeMissingObj);
}

// Domains
var maxElev = 2600;
    maxDistance = 60000; // 60km

// SVG vars
var svgElev, gProfile,
    xElev, yElev,
    xElevAxis, yElevAxis,
    profilePath;

    // Size without
var margin = {top: 30, right: 60, bottom: 30, left: 34},
    microvisWidth,
    microvisHeight,
    graphWidth,
    graphHeight;

// Helpers
var currentLine, currentCircle, currentText, currentTextPlace, currentTextElev;

function drawElevationProfile(placeObj, routeObj, missingObj) {

    // Total width (with margins)
    microvisWidth = parseInt(d3.select('#info #microvis').style("width"), 10);
    microvisHeight = parseInt(d3.select('#info .content').style("height"), 10) - 80;

    // console.log("w: " + microvisWidth + ", h: " + microvisHeight);

    // Size of the graphic (without margins)
    graphWidth = microvisWidth - margin.left - margin.right;
    graphHeight = microvisHeight - margin.top - margin.bottom;

    var routeData = routeObj.route_sliced.features;
    var missingData = (missingObj) ? missingObj.missing_sliced.features : [];
    var totalData = routeData.concat(missingData);

    // console.log("width: " + app.layout.microvisWidth);
    // console.log("height: " + app.layout.microvisHeight);

    // Set the ranges
    xElev = d3.scale.linear().range([0, graphWidth]).domain([0, maxDistance/10]) // maxDistance/10 because each step are 10m
    yElev = d3.scale.linear().range([graphHeight, 0]).domain([0, maxElev]);

    // Axis
    yElevAxis = d3.svg.axis()
        .ticks(4)
        .tickFormat(function(d) { return d + "m"; })
        .tickSize(-graphWidth)
        .tickPadding(5)
        .scale(yElev)
        .orient("left");

    xElevAxis = d3.svg.axis()
        .ticks(5)
        .tickFormat(function(d) { return (d*10)/1000 + "km"; })
        // .tickSize(-graphHeight)
        // .tickSize(0)
        .tickPadding(10)
        .scale(xElev)
        .orient("bottom")

    // Define the path
    profilePath = d3.svg.line()
        .interpolate("basis")
        .x(function(d, i) { return xElev(i); })
        .y(function(d, i) { return yElev(d.properties.elevation); })

    // Adds the svg canvas
    svgElev = d3.select("#microvis-route-profile")
        .append("svg")
            .attr("class", "elevation")
            .attr("width", microvisWidth)
            .attr("height", microvisHeight)

    /////////////////////
    // Start with data
    /////////////////////

    // console.log("length: " + routeData.length + ", missing length: " + missingData.length + " min: " + d3.min(totalData, function(d) { return d.properties.elevation; }) + ", max: " + d3.max(totalData, function(d) { return d.properties.elevation; }));

    //////////
    // Axis
    //////////

    svgElev.append("g")
        .attr("class", "axis y")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(yElevAxis)

    svgElev.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(" + margin.left + "," + (graphHeight + margin.top) + ")")
        .call(xElevAxis)
        .selectAll("text")
            .style("text-anchor", "end");

    ///////////////////////
    // Elevation profile
    ///////////////////////

    gProfile = svgElev.append("g")
        .attr("class", "profile-group")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add the road route path.
    gProfile.append("path")
        .attr("class", "profile route")
        .attr("d", profilePath(routeData));

    // Add the missing route path
    gProfile.append("path")
        .attr("class", "profile missing")
        .attr("d", profilePath(missingData))
        .attr("transform", "translate(" + xElev(routeData.length) + ",0)")

    /////////////////////
    // Helper elements
    /////////////////////

    currentLine = gProfile.append("line").attr("class", "current")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", graphHeight)
        .style("visibility", "hidden");
    currentCircle = gProfile.append("circle").attr("class", "current")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 2)
        .style("visibility", "hidden");
    // var currentText = gProfile.append("text").attr("class", "current-text")
    currentText = gProfile.append("g").attr("class", "current-text")
        .style("visibility", "hidden");
    currentTextPlace = currentText.append("text");
    currentTextElev = currentText.append("text").attr("class", "sec");

    gProfile.append("rect")
        .attr("class", "hit")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .on("mouseenter", mouseenter)
        .on("mousemove", mousemoved)
        .on("mouseout", mouseout);

    function mouseenter() {
        currentLine.style("visibility", "visible");
        currentCircle.style("visibility", "visible");
        currentText.style("visibility", "visible");
    }

    function mousemoved() {
        var m = d3.mouse(this);

        // Get domain value
        var mouseX = m[0];
        var i = Math.round(xElev.invert(mouseX));

        // Check invalid values
        if (i < 0) { i = 0; }
        if (i >= totalData.length) { i = totalData.length-1; }

        // Get elevation
        var dist = (i*10)/1000;
        var elev = Math.round(totalData[i].properties.elevation);

        currentLine
            .attr("x1", xElev(i))
            .attr("y1", yElev(0))
            .attr("x2", xElev(i))
            .attr("y2", yElev(elev))

        currentCircle
            .attr("cx", xElev(i))
            .attr("cy", yElev(elev))

        currentTextPlace
            .attr("x", xElev(i) - 2)
            .attr("y", yElev(elev) - 22)
            .text(function() {
              return "Dist: " + dist + " km";  // Value of the text
            });

        currentTextElev
            .attr("x", xElev(i) - 2)
            .attr("y", yElev(elev) - 12)
            .text(function() {
              return "Elev: " + elev + " m";  // Value of the text
            });
    }

    function mouseout(d, i) {
        currentLine.style("visibility", "hidden");
        currentCircle.style("visibility", "hidden");
        currentText.style("visibility", "hidden");
    }

    // Call the resize function whenever a resize event occurs
    // window.addEventListener("resize", redrawElevationProfile);
    // d3.select(window).on('resize', redrawElevationProfile);

    d3.select(window).on('resize', resize);

    function resize() {

        // update width
        microvisWidth = parseInt(d3.select('#info #microvis').style("width"), 10);
        microvisHeight = parseInt(d3.select('#info .content').style("height"), 10) - 80;

        // microvisWidth = parseInt($infoBox.find('#microvis').width(), 10);
        // microvisHeight = parseInt($infoBox.find('.content').height(), 10) - 35;

        graphWidth = microvisWidth - margin.left - margin.right;
        graphHeight = microvisHeight - margin.top - margin.bottom;

        // reset ranges
        xElev.range([0, graphWidth]);
        yElev.range([graphHeight, 0]);

        // resize svg element
        svgElev.attr("width", microvisWidth);
        svgElev.attr("height", microvisHeight);

        // resize paths
        svgElev.select(".profile.route")
            .attr("d", profilePath(routeData));

        // Add the missing route path
        svgElev.select(".profile.missing")
            .attr("d", profilePath(missingData))
            .attr("transform", "translate(" + xElev(routeData.length) + ",0)")

        svgElev.select("rect.hit")
            .attr("width", graphWidth)
            .attr("height", graphHeight);

        // update axes
        yElevAxis.tickSize(-graphWidth);

        svgElev.select('.x.axis')
            .attr("transform", "translate(" + margin.left + "," + (graphHeight + margin.top) + ")")
            .call(xElevAxis);
        svgElev.select('.y.axis').call(yElevAxis);
    }
}


/*function drawElevationProfile(d, routeData) {

    // Set the ranges
    xElev = d3.scale.linear().range([0, app.layout.microvisWidth]);
    yElev = d3.scale.linear().range([app.layout.microvisHeight, 0]);

    // Scale the range of the data
    xElev.domain([0, routeData.length]);
    yElev.domain([0, d3.max(routeData, function(d) { return d[2]; })]);

    // Color range
    var color = d3.scale.linear()
      .domain([0, 1500]) // this is updated when data loaded
      .range(["#2FB8E9", "yellow"]);

    // Check interpolations here:
    // http://jorditost.local:5757/snippets/microvis/graph.html

    // Define the line
    lineElev = d3.svg.line()
        .interpolate("basis")
        .x(function(d, i) { return xElev(i); })
        .y(function(d) { return yElev(d[2]); });

    areaElev = d3.svg.area()
        .interpolate("basis")
        .x(function(d, i) { return xElev(i); })
        .y0(app.layout.microvisHeight)
        .y1(function(d) { return yElev(d[2]); });

    // Adds the svg canvas
    svgElev = d3.select("#microvis-route-profile")
    // svgElev = d3.select("#microvis")
        .append("svg")
            .attr("class", "elevation")
            .attr("width", app.layout.microvisWidth)
            .attr("height", app.layout.microvisHeight);

    // svgElev.append("text").text("Elevation profile");

    gElev = svgElev.append("g");

    // Add the line path.
    gElev.append("path")
            .attr("class", "line")
            .attr("d", lineElev(routeData));

    // Add the area/bg path
    gElev.append("path")
            .attr("class", "area")
            .attr("d", areaElev(routeData));

    // Call the resize function whenever a resize event occurs
    // d3.select(window).on('resize', resizeElevationProfile);
    resizeElevationProfile();
}

// Resize Elevation Profile
function resizeElevationProfile() {

    svgElev.attr("width", app.layout.microvisWidth);

    // Update the range of the scale with new width/height
    xElev.range([0, app.layout.microvisWidth]);
    // yElev.range([layoutVars.microvisHeight, 0]);

    // Force D3 to recalculate and update the line
    svgElev.selectAll('.line')
            .attr("d", lineElev(routeData));

    svgElev.selectAll('.area')
            .attr("d", areaElev(routeData));
}*/


var svgRoute;

function drawRoute(d, routeData) {

    svgRoute = d3.select("#microvis-route")
    // svgRoute = d3.select("#microvis")
        .append("svg")
        .attr("class", "route")

    // svgRoute.append("text").text("Route from Valledupar");

    svgRoute.append("g")
            .append("path")
                .attr("data-id", d.properties.osm_id)
                .attr("class", "line route")
                .attr("d", lineFunction(routeData));

    // Call the resize function whenever a resize event occurs
    // d3.select(window).on('resize', resizeRoute);

    resizeRoute();
}

// Resize Elevation Profile
function resizeRoute() {

    var gRoute = svgRoute.select("g");
    var bbox = gRoute.node().getBBox();
    var factor = app.layout.microvisWidth/bbox.width;
    var offsetX = -bbox.x * factor;
    var offsetY = -bbox.y * factor;

    // console.log(bbox);
    // console.log("microvis width: " + app.layout.microvisWidth + ", bbox width: " + bbox.width + ", factor: " + factor);

    svgRoute.attr("width", app.layout.microvisWidth)
            .attr("height", factor*bbox.height);

    gRoute.attr("transform", " translate("+offsetX+","+offsetY+") scale("+factor+")");
}


///////////////////
// FOS Functions
///////////////////

function loadFOSByLineString(lineString, id) {

    console.log("load FOS by GeoJSON LineString");
    console.log(app.config.apiBase + "/fos/route/");
    console.log(lineString);

    var params = {
        feature: JSON.stringify(lineString),
        buffer: config.threat.buffer,
        intersect: config.threat.intersect
    };

    $.ajax({
        method: "POST",
        url: app.config.apiBase + "/fos/route/",
        data: JSON.stringify(params),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (fosFC) {
            console.log("FOS loaded");
            console.log(fosFC);

            drawFOS(fosFC, id);
        },
        error: function(error) {
            console.log(JSON.stringify(error));
        }
    });
}

function hideFOS(id) {

    if (!map.getSource("fos-"+id)) return;
    //
    // removeFOSLayers(id);
    // map.removeSource("fos-"+id);

    map.setLayoutProperty("fos1-"+id, 'visibility', 'none');
    map.setLayoutProperty("fos2-"+id, 'visibility', 'none');
    map.setLayoutProperty("fos3-"+id, 'visibility', 'none');
}

// function removeFOSLayers(id) {
//     map.removeLayer("fos1-"+id);
//     map.removeLayer("fos2-"+id);
//     map.removeLayer("fos3-"+id);
// }

function drawFOS(fosFC, id) {

    // Add source if exists
    if (!map.getSource("fos-"+id)) {
        map.addSource('fos-'+id, {
           type: 'geojson',
           data: fosFC
        });
    // If source exists, set data
    } else {
        map.getSource("fos-"+id).setData(fosFC);
    }

    // Only add layers first time
    if (!map.getLayer("fos1-"+id)) {
        map.addLayer({
            "id": "fos3-"+id,
            "type": "fill",
            "source": "fos-"+id,
            "filter": ["==", "fos", 3],
            "paint": {
                "fill-color": "#F7D57F",
                "fill-opacity": 0.8,
                "fill-antialias": false
            }
        });
        map.addLayer({
            "id": "fos2-"+id,
            "type": "fill",
            "source": "fos-"+id,
            "filter": ["==", "fos", 2],
            "paint": {
                "fill-color": "#F5A623",
                "fill-opacity": 0.8,
                "fill-antialias": false
            }
        });
        map.addLayer({
            "id": "fos1-"+id,
            "type": "fill",
            "source": "fos-"+id,
            "filter": ["==", "fos", 1],
            "paint": {
                "fill-color": "#ED5D5A",
                "fill-opacity": 0.8,
                "fill-antialias": false
            }
        });
    } else {
        map.setLayoutProperty("fos1-"+id, 'visibility', 'visible');
        map.setLayoutProperty("fos2-"+id, 'visibility', 'visible');
        map.setLayoutProperty("fos3-"+id, 'visibility', 'visible');
    }
}

///////////////////////////////
// Settlement Click Callback
///////////////////////////////

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

// This callback is called when clicking on a location
function onSettlementClicked(d) {

    // Check if settlement is already active
    if ($.inArray(d.properties.osm_id, app.selectedSettlements) >= 0) {
        // settlement is already active > make it inactive
        d3.selectAll(".village[data-id='"+d.properties.osm_id+"']").classed("selected", false);
        d3.selectAll("g[data-id='"+d.properties.osm_id+"']").classed("selected-settlement", false);
        app.selectedSettlements.remove(d.properties.osm_id);

        // This class is used for CSS control
        if (app.selectedSettlements.length == 0) {
            svg.classed("detail", false);
        }

    // If it is not active, activate it
    } else {

        // Get coordinates from the symbol and center the map on those coordinates
        // map.flyTo({center: d.geometry.coordinates, zoom: 11});
        // loadFOS(d.properties.osm_id)

        // var currentSettlement = d3.select(this);
        // currentSettlement.classed("selected", !currentSettlement.classed("selected")); // This is done inside onSettlementClicked(d) now

        // Deactivate active settlements, if only one is configured
        if (!app.config.multipleSettlements) {
            deactivateSelectedSettlements();
        }

        // Activate selected settlement's dot
        d3.selectAll(".village[data-id='"+d.properties.osm_id+"']").classed("selected", true);

        // Activate selected settlement's group
        d3.selectAll("g[data-id='"+d.properties.osm_id+"']").classed("selected-settlement", true);

        // Move route to front
        var route = d3.select("#routesfromvalledupar g[data-id='"+d.properties.osm_id+"']")
        route.moveToFront();

        // Mark settlement as active
        app.selectedSettlements.push(d.properties.osm_id);

        // This class is used for CSS control
        svg.classed("detail", true);

        // Get current route and missing profile
        activeRouteObj = getElementByPlaceID(d.properties.osm_id, routesJSON.routes);
        activeMissingObj = getElementByPlaceID(d.properties.osm_id, routesJSON.missing);

        // Load FOS along route
        if (config.threat.show) {
            hideFOS("route");

            routeGeoJSON = getGeoJSONFeatureByPlaceID(d.properties.osm_id, routesGeoJSON);
            loadFOSByLineString(routeGeoJSON, "route");
        }

        // show the info box
        showInfoBox(d);
    }

    // check if any settlement is active
    if (app.selectedSettlements.length > 0) {

        // at least one settlement is active > deactivate the other layers
        for (var key in app.layers) {
            if (app.layers.hasOwnProperty(key)) {
                app.layers[key].active = false;
                //app.layers[key].layer.setActive(app.layers[key].active);
                d3.selectAll(".mode#"+key).classed("active", app.layers[key].active);
            }
        }

        app.layout = calculateLayoutVars();

        update(app.config.transitionTime);

    } else {

        for (var key in app.layers) {
            if (key === "routesfromvalledupar" || key === "missinginfrastructure") {
                if (app.layers.hasOwnProperty(key)) {
                    app.layers[key].active = true;
                    //app.layers[key].layer.setActive(app.layers[key].active);
                    d3.selectAll(".mode#"+key).classed("active", app.layers[key].active);
                }
            }
        }

        app.layout = calculateLayoutVars();
        hideInfoBox(d);
        hideFOS("route");

        // Hide isolines item in legend
        $("#legend .legend-item.isolines").addClass("hide");
        $("#legend .legend-item.threat").addClass("hide");

        update(app.config.transitionTime);

    }

}


function deactivateSelectedSettlements() {

    if (app.selectedSettlements.length == 0) {
        return false;
    }

    // Deactivate active settlement
    var currentSettlement = app.selectedSettlements[0];

    // Activate dot
    d3.selectAll(".village[data-id='"+currentSettlement+"']").classed("selected", false);

    // Activate group (isolines, etc.)
    d3.selectAll("g[data-id='"+currentSettlement+"']").classed("selected-settlement", false);

    app.selectedSettlements.remove(currentSettlement);

    if (app.selectedSettlements.length == 0) {
        svg.classed("detail", false);
    }

    // for (var i=0; i<app.selectedSettlements; i++) {
    //     // console.log(app.selectedSettlements[i]);
    //     d3.selectAll(".village[data-id='"+app.selectedSettlements[i]+"']").classed("selected", false);
    //     d3.selectAll("g[data-id='"+app.selectedSettlements[i]+"']").classed("selected-settlement", false);
    //     app.selectedSettlements.remove(app.selectedSettlements[i]);
    // }
}





Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
