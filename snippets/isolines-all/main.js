var concaveman = require('concaveman');

var map;

var currentMode, isoline;
var isolines_collection = [];
var isolinesGroup;

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
        center: [-73.13, 10.403]
    });

    map.addControl(new mapboxgl.Navigation());

    map.on('load', function () {
        isolineAll();
    });

    // MapboxGL container
    var container = map.getCanvasContainer()

    // d3 canvas
    var svg = d3.select(container).append("svg").attr("id", "map-features"),
        isolinesGroup = svg.append("g").attr("class", "isolinesGroup");

    var featureElement = svg
        .append("g")
            .attr("class", "villages")
            .selectAll("circle")
            .data(geojson.features)
            .enter()
            .append("circle")
                .attr({
                    "r": 5
                })
                .attr("class", "village")
                .attr("data-id", function() { return generateUniqueID(); })
                .on("click", function(d) {
                    d3.select(this).classed("selected", true);
                    var objectID = d3.select(this).attr("data-id");
                    click(d, objectID);
                });

    //This is the accessor function we talked about above
    lineFunction = d3.svg.line()
                        .x(function(d) { return project(d).x; })
                        .y(function(d) { return project(d).y; })
                        .interpolate("linear");


    // This callback is called when clicking on a location
    function click(d, objectID) {
        var coordinates = d.geometry.coordinates;
        console.log(d);
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

            var poly = result;

            console.log(JSON.stringify(result));

            poly.properties.objectID = objectID;

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

            var polyBuffered = turf.buffer(poly, 500, "meters");

            var isInside = turf.inside(settlementPoint, polyBuffered.features[0]);

            if (isInside) {

                // Add original polygon
                map.addSource(objectID, {
                    'type': 'geojson',
                    'data': poly
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

                // var isoline = isolinesGroup
                //     .append("polygon")
                //     .data([coordArray])
                //     .attr("class", "isoline")
                //     .attr("data-refobjectid", objectID);


                // $("polygon").hover(
                //     function() {
                //         var idstring = "[data-id='"+$(this).data('refobjectid')+"']";
                //         console.log(idstring);
                //         $(".village").filter(idstring).addClass("active");
                //     }
                // );

                isolines_collection.push(isoline);

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



    function update() {

        // Update villages
        featureElement
            .attr({
                cx: function(d) { return project(d.geometry.coordinates).x; },
                cy: function(d) { return project(d.geometry.coordinates).y; },
            });

            console.log("UPDATE");

        for (var j=0; j<isolines_collection.length; j++) {

            if (typeof isolines_collection[j] !== 'undefined') {
                isolines_collection[j]
                    .attr("points",function(d) {
                        var test = [];
                        for (var i=0; i<d.length; i++) {
                            test.push([project(d[i]).x, project(d[i]).y].join(","));
                        }
                        return test.join(" ");
                    });
            }


        }

    }

    // Update d3 map features
    update();

    // Map Interaction
    map.on("viewreset", update);
    map.on("movestart", function() {
        svg.classed("hidden", true);
    });

    map.on("moveend", function() {
        update();
        svg.classed("hidden", false);
    });

    // Use MapboxGL projection for d3 features
    function project(d) {
        return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
    }
}

////////////////
// Math Utils
////////////////

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function generateUniqueID() {
    return 'id' + (new Date).getTime().toString() + Math.random().toString(36).substr(2, 16);
};


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
