/*global d3:true */
/*global mapboxgl:true */
/*global turf:true */
/*global console:true */

var concaveman = require('concaveman');

var map,
    svg,
    gVillages,
    // gIsolines,
    path;

var currentMode;

var isolineColor = '#3dc8e7'; //'#26D1F9',
    isolineOpacity = 0.35;

// Load places
d3.json("../../data/places_aoi.json", function(err, data) {
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
        // isolineAll();
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
                .append("circle")
                    .attr({
                        "r": 5
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
        // var coordinates = d.geometry.coordinates;
        // console.log(d);
        if (currentMode === "isoline" || currentMode === "isoline-all") {
            getIsoline(d, objectID);
        }
    }

    function getIsoline(d, objectID) {

        var coordinates = d.geometry.coordinates;

        var coords = coordinates[1]+','+coordinates[0],
            range = parseInt($("#range__slider").val());

        var uri = 'http://localhost:61002/api/isoline/' + coords + '/' + range;

        // Define a callback function to process the isoline response.
        var onIsolineResult = function(result) {

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

                // var isoline = gIsolines
                //     .append("path")
            	// 	.data([polygon])
                //     .attr("class", "isoline")
                //     .attr("data-refobjectid", objectID);

                // var isoline = gIsolines
                //     .append("polygon")
                //     .data([polygon])
                //     .attr("class", "isoline")
                //     .attr("data-refobjectid", objectID);

                update();
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
    map.on("move", update);
    // map.on("movestart", function() {
    //     svg.classed("hidden", true);
    // });

    // map.on("moveend", function() {
    //     update();
    //     svg.classed("hidden", false);
    // });

    // Update d3 map features
    update();
}


///////////////
// Update d3
///////////////

function update() {

    console.log("UPDATE");

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

    // gIsolines.selectAll("path").each(function(d, index) {
    //     var isoline = d3.select(this);
    //     isoline.attr("d", path);
    // });

    // for (var j=0; j<isolines_collection.length; j++) {
    //
    //     if (typeof isolines_collection[j] !== 'undefined') {
    //         isolines_collection[j]
    //             .attr("points",function(d) {
    //                 var test = [];
    //                 for (var i=0; i<d.length; i++) {
    //                     test.push([project(d[i]).x, project(d[i]).y].join(","));
    //                 }
    //                 return test.join(" ");
    //             });
    //     }
    // }
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
