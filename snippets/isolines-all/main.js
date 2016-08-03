// @codekit-prepend "js/digenti-framework.js"
/*global d3:true */
/*global mapboxgl:true */
/*global turf:true */
/*global console:true */

var concaveman = require('concaveman');

var map,
    svg,
    gVillages,
    path;

var currentMode = "isoline-all",
    view = "mode";

var places_aoi;

var circleRadius = 5;

var isolinesLoaded = 0;

var isolineColor = '#3dc8e7'; //'#26D1F9',
    isolineOpacity = 0.35;

// Load places
d3.json("../../data/places_aoi.json", function(err, data) {
    places_aoi = data;
    mapDraw(data);
});


//////////////
// Map draw
//////////////

function mapDraw(geojson) {

    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi',
        zoom: 11,
        center: [-73.06, 10.410]
    });

    map.addControl(new mapboxgl.Navigation());

    map.on('load', function () {
        isolineAll();
    });

    // MapboxGL container
    var container = map.getCanvasContainer();

    // d3 canvas
    svg = d3.select(container).append("svg").attr("id", "map-features");

    // Isolines group
    // gIsolines = svg.append("g").attr("class", "isolines");

    // Path transform
    var transform = d3.geo.transform({point: projectPoint});
	path = d3.geo.path().projection(transform);

    // Draw villages
    gVillages = svg
        .append("g")
            .attr("class", "villages")
            .selectAll("circle")
            .data(geojson.features)
            .enter()
            .append("g")
                .attr("data-id", function(d) { return d.properties.osm_id; })
                .attr("class", "village-group")
                .append("circle")
                    .attr({
                        "r": circleRadius
                    })
                    .attr("class", "village")
                    .attr("data-id", function(d) { return d.properties.osm_id; })
                    .on("click", function(d) {
                        d3.select(this).classed("selected", true);
                        var objectID = d3.select(this).attr("data-id");
                        click(d, objectID);
                    });

    // This callback is called when clicking on a location
    function click(d, objectID) {
        var coordinates = d.geometry.coordinates;
        // console.log(d);
        if (currentMode === "isoline" || currentMode === "isoline-all") {
            getIsoline(coordinates, objectID);
        }
    }

    function getIsoline(coordinates, objectID) {

        var coords = coordinates[1]+','+coordinates[0],
            range = parseInt($("#range__slider").val());

        var uri = 'http://localhost:61002/api/isoline/' + coords + '/' + range;

        // Define a callback function to process the isoline response.
        var onIsolineResult = function(result) {

            isolinesLoaded++;

            var polygon = result;

            // console.log(JSON.stringify(result));

            polygon.properties.objectID = objectID;

            var settlementPoint = {
                "type": "Feature",
                "properties": {
                    "marker-color": "#f00"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": coordinates
                }
            };

            var polygonBuffered = turf.buffer(polygon, 500, "meters");

            var isInside = turf.inside(settlementPoint, polygonBuffered.features[0]);

            if (isInside) {

                // mapboxgl isoline
                map.addSource(objectID, {
                    'type': 'geojson',
                    'data': polygon
                });

                map.addLayer({
                    'id': 'isoline_'+objectID,
                    'type': 'fill',
                    'source': objectID,
                    'layout': {},
                    'paint': {
                        'fill-color': isolineColor,
                        'fill-opacity': isolineOpacity
                    }
                });

                // d3 isoline
                var isoline = svg.select('g[data-id="'+objectID+'"]')
                    .append("path")
            		.data([polygon])
                    .attr("class", "isoline")
                    .attr("data-id", objectID);

            }

            // Update isolines when all loaded
            if (isolinesLoaded == places_aoi.features.length) {
                update();
                activateButtons();
            }
        };

        $.ajax({
            dataType: "json",
            url: uri,
            //   url: 'http://localhost:61002/api/isoline/',
            //   data: {
            //       coords: coords,
            //       range: range
            //   },
            success: onIsolineResult,
            error: function(error) {
                alert(error);
            }
        });
    }

    // Map Interaction
    map.on("viewreset", update);
    map.on("movestart", function() {
        svg.classed("hidden", true);
    });

    map.on("moveend", function() {
        update();
        svg.classed("hidden", false);
    });

    // Update d3 map features
    update();
}


///////////////
// Update d3
///////////////

function update(transition_time) {

    transition_time = (typeof transition_time === undefined) ? 0 : transition_time;

    w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    // Small multiples
    if (view === "smallmultiples") {

        console.log("triggerSmallMultiplesView");

        // Hide villages
        // svg.selectAll(".village")
        //     .transition()
        //     .duration(transition_time)
        //     .attr("opacity", 0);

        // Transform isolines
        var ix = 0;
        var iy = 0;
        var rows = 7;
        var cols = 6;

        var gap_hor = (w*0.8)/(cols+1);
        var gap_ver = 20;


        var max_path_w = 0;
        var max_path_h = 0;


        svg.selectAll(".village-group").each(function(d, i) {

            console.log("village: " + i);

            var current_el = d3.select(this);

            //gSM.append(current_el);

            var current_path_w = current_el.node().getBBox().width;
            var current_path_h = current_el.node().getBBox().height;

            if (current_path_h>max_path_h) { max_path_h = current_path_h; }
            if (current_path_w>max_path_w) { max_path_w = current_path_w; }
        });

        var widthperelement = w*0.8/(cols);
        var heightperelement = h/(rows)-gap_ver;

        var gap_left = w*0.2;

        var faktor_height = heightperelement/max_path_h;
        var faktor_width = widthperelement/max_path_w;

        console.log("max_path_w: "+max_path_w);
        console.log("max_path_h: "+max_path_h);

        var scaleFactor = faktor_height;
        if (faktor_width<scaleFactor) { scaleFactor=faktor_width; }

        // Update isolines
        svg.selectAll(".village-group").each(function(d, index) {
            var current_el = d3.select(this);
            current_el
                .transition()
                //.delay(20 * i)
                .duration(transition_time)
                    .style("opacity", 1)
                    .attr("transform", function() {
                        var x = (gap_left/scaleFactor)+(ix+0.5)*(widthperelement/scaleFactor)-current_el.node().getBBox().x-((current_el.node().getBBox().width)/2);
                        var y = (iy+0.5)*((heightperelement+gap_ver)/scaleFactor)-current_el.node().getBBox().y-((current_el.node().getBBox().height)/2);
                        ix++;
                        if (ix === cols) { ix = 0; }
                        iy++;
                        if (iy === rows) { iy = 0; }
                        return "scale("+scaleFactor+") translate("+x+","+y+")";
                    })
                    .selectAll("path")
                        .attr("stroke-width", function() {
                            return 2/scaleFactor;
                        });
            current_el.selectAll("circle")
                .transition()
                .delay(transition_time/6)
                .duration(transition_time)
                .attr({
                    "r": 4/scaleFactor
                });
        });

        setMapOpacity(0.08);

    // Map view
    } else {

        // Update villages
        svg.selectAll(".village")
            .attr({
                cx: function(d) { return project(d.geometry.coordinates).x; },
                cy: function(d) { return project(d.geometry.coordinates).y; },
            });

        // Update isolines
        svg.selectAll(".isoline").each(function(d, index) {
            var isoline = d3.select(this);
            isoline.attr("d", path);
        });


        svg.selectAll(".village-group").each(function(d, i) {

            var current_el = d3.select(this);
            current_el
                .transition()
                //.delay(20 * i)
                .duration(transition_time)
                    // .style("opacity", 1)
                    // .attr("stroke-width", 2)
                    .attr("transform", "");

            current_el.selectAll("circle")
                .transition()
                .delay(transition_time/100)
                .duration(transition_time)
                .attr({
                    "r": circleRadius
                });

        });

        setMapOpacity(1);
    }

    console.log("UPDATE");
}


////////////////////
// Map Projection
////////////////////

// Use MapboxGL projection for d3 features
function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}

function projectPoint(lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    this.stream.point(point.x, point.y);
}


////////////////////////
// GUI / Interactions
////////////////////////

var basemap_select = document.getElementById('basemap_select');
var basemap_select_options = basemap_select.options;

basemap_select.onchange = function() {
    var selectedValue = basemap_select_options[basemap_select.selectedIndex].value;
    switchLayer(selectedValue);
}

function switchLayer(layer) {
    if (layer == 'DIGENTI') {
        map.setStyle('mapbox://styles/jorditost/cipseaugm001ycunimvr00zea');
    } else if (layer == 'DIGENTI-Light') {
        map.setStyle('mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi');
    } else if (layer == 'DIGENTI-Dark') {
        map.setStyle('mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t');
    } else if (layer == 'fos-outdoor') {
        map.setStyle('mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft');
    } else {
        map.setStyle('mapbox://styles/mapbox/' + layer);
    }
}

// Isoline range
function showValue() {
    var val = $("#range__slider").val();
	document.getElementById("range").innerHTML = val + " minutes";
}

showValue();


///////////////////
// Trigger Views
///////////////////

function reorderSmallMultiples(ob) {
    orderby = ob;
    d3.selectAll(".orderby").classed("active", false);
    d3.selectAll("."+orderby).classed("active", true);
    update(500);
}

function triggerMapView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", true);
    view = "map";
    update(500);
}

function triggerSmallMultiplesView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".smallmultiplesview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", false);
    view = "smallmultiples";
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


///////////
// Modes
///////////

function setMode(mode) {
    d3.selectAll("button.mode").classed("active", false);
    currentMode = mode;
    d3.select("."+mode).classed("active", true);
}

function isolineAll() {
    setMode('isoline-all');
    $( ".village" ).each(function(index) {
        $(this).d3Click();
    });
}

$.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};
