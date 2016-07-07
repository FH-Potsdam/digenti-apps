var platform = new H.service.Platform({
  'app_id': 'EOg7UyuSFbPF0IG5ANjz',
  'app_code': 'iRnqNl0dyzX_8FOlchD0ZQ'
});

var router = platform.getRoutingService();
// Get an instance of the enterprise routing service:
var enterpriseRouter = platform.getEnterpriseRoutingService();






function showValue() {
    var val = $("#range__slider").val();
	document.getElementById("range").innerHTML = val + " minutes";
}

showValue();





$.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};


function isolineAll() {
    $( ".village" ).each(function( index ) {
        console.log("asdasd");
        $( this ).d3Click();
    });
}




















var linePadding = 15;

/*L.mapbox.accessToken = 'pk.eyJ1IjoiZmFiaWFuZWhtZWwiLCJhIjoiNDZiNTI3NGQxNzRiNjgxMGEwYTljYjgzZDU5ZjdjODYifQ.Mu_TWKlvON7j4UAkQ1EXJg';
var map = L.mapbox.map('map', 'mapbox.satellite')
    .setView([0, 0], 1);*/

d3.json("../../data/places_aoi.json", function(err, data) {
    mapDraw(data);
});

var routes_points = [];
var routes_paths = [];
var lines_paths = [];
var routes_foot_points = [];
var routes_foot_paths = [];
var routing_history = [];
var pathData, pathFootData;
var routes_collection = [];
var gRoutes, lineFunction;
var currentMode, isoline;
var isolines_collection = [];
var isolinesGroup;

//mapDraw("geojson");

function mapDraw(geojson) {

    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi',
        // style: 'mapbox://styles/jorditost/cipseaugm001ycunimvr00zea',
        //style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 11,
        center: [-73.02, 10.410]
    });

    map.addControl(new mapboxgl.Navigation());

    map.on('load', function () {
        // drawFOSLines();
    });

    function drawFOSLines() {
        map.addSource('colombia-fos', {
            type: 'vector',
            url: 'mapbox://jorditost.49a7b9e1'
        });

        map.addLayer({
            "id": "fos3",
            "type": "line",
            "source": "colombia-fos",
            "source-layer": "colombia_fos_h1_m0_5_CLASSIFIED_wgs84",
            "filter": ["==", "elev", 3],
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#e6dc51",
                "line-width": 2,
                "line-opacity": 0.3
            }
        });
        map.addLayer({
            "id": "fos2",
            "type": "line",
            "source": "colombia-fos",
            "source-layer": "colombia_fos_h1_m0_5_CLASSIFIED_wgs84",
            "filter": ["==", "elev", 2],
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#d9943f",
                "line-width": 2,
                "line-opacity": 0.3
            }
        });
        map.addLayer({
            "id": "fos1",
            "type": "line",
            "source": "colombia-fos",
            "source-layer": "colombia_fos_h1_m0_5_CLASSIFIED_wgs84",
            "filter": ["==", "elev", 1],
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#c74d4d",
                "line-width": 2,
                "line-opacity": 0.3
            }
        });
    }

    // MapboxGL container
    var container = map.getCanvasContainer()

    // d3 canvas
    var svgMorph = d3.select(container).append("svg").attr("class", "map-morphed"),
        svg = d3.select(container).append("svg").attr("class", "map-features");

    gRoutes = svg.append("g").attr("class", "routes");
    var gLines = svgMorph.append("g").attr("class", "route-lines");

    isolinesGroup = svg.append("g").attr("class", "isolinesGroup");

    // var svg = d3.select(container).append("svg")
                // .attr("id", "map-features")

    var featureElement = svg
        .append("g")
            .attr("class", "villages")
            .selectAll("circle")
            .data(geojson.features)
            .enter()
            .append("circle")
                .attr({
                    "r": 8
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


        routing_history.push(coordinates[1]+","+coordinates[0]);

        if (currentMode === "routing") {
            if (routing_history.length > 1) {
                routingCar(coordinates);
                //routingFoot(coordinates);
            }
        }

        if (currentMode === "isoline") {
            getIsoline(coordinates, objectID);
        }

    }




    function getIsoline(coordinates, objectID) {

        console.log(coordinates);


        var range = parseInt($("#range__slider").val());
        var rangeforAPI = (range*1000).toString();
        console.log(rangeforAPI);

        c = 'geo!'+coordinates[1]+','+coordinates[0];

        // Create the parameters for the routing request:
        var routingParams = {
          mode: 'fastest;car',
          resolution: '1',
          maxpoints: '1000',
          rangetype: 'time',
          start: c,
          distance: rangeforAPI
        };

        console.log(c);


        // Define a callback function to process the isoline response.
        var onIsolineResult = function(result) {

            console.log(result);

            var coordArray = result.Response.isolines[0].value;
            coordArray = transformHEREgeometry(coordArray);

            console.log(coordArray);

            var poly = {
              "type": "Feature",
              "properties": {
                  "objectID": objectID
              },
              "geometry": {
                "type": "Polygon",
                "coordinates": [coordArray]
              }
            };

            console.log(JSON.stringify(poly));

            var pt1 = {
              "type": "Feature",
              "properties": {
                "marker-color": "#f00"
              },
              "geometry": {
                "type": "Point",
                "coordinates": coordinates
              }
            };

            var poly_buffered = turf.buffer(poly, 500, "meters");
            console.log(poly_buffered);

            var isInside1 = turf.inside(pt1, poly_buffered.features[0]);
            console.log(isInside1);

            //isolinesGroup.append("polygon")

            if (isInside1) {

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
                        'fill-color': '#088',
                        'fill-opacity': 0.1
                    }
                });

                /*var isoline = isolinesGroup
                    .append("polygon")
                    .data([coordArray])
                    .attr("class", "isoline")
                    .attr("data-refobjectid", objectID);


                $("polygon").hover(
                    function() {
                        var idstring = "[data-id='"+$(this).data('refobjectid')+"']";
                        console.log(idstring);
                        $(".village").filter(idstring).addClass("active");
                    }
                );

                isolines_collection.push(isoline);

                update();*/


            }


        };

        // Call the Enterprise Routing API to calculate an isoline:
        enterpriseRouter.calculateIsoline(
            routingParams,
            onIsolineResult,
            function(error) {
                alert(error.message);
            });



    }




    function routingCar(coordinates) {

        // set parametes for API-call
        var routeRequestParams = {
                mode: 'fastest;car',
                representation: 'display',
                routeattributes: 'waypoints,summary,shape,legs',
                maneuverattributes: 'direction,action',
                waypoint0: routing_history[routing_history.length-2], // start
                waypoint1: routing_history[routing_history.length-1], // finish
                returnelevation: 'true'
            };
        // call API
        router.calculateRoute(routeRequestParams, onSuccess, onError);

        // case of error (hopefully not…)
        function onError(e) { console.log(e); }

        // succeeded!
        function onSuccess(r) {

            var response = r.response;

            // initialize route from response
            var route = {
                    init: function() {
                        this.id = generateUniqueID();
                        this.geometry = transformHEREgeometry(response.route[0].shape);
                        this.travelTime = response.route[0].summary.travelTime;
                        this.path = lineFunction(this.geometry);
                        return this;
                    }
                }.init();

            // push route to collection-array
            routes_collection.push(route);

            // generate lineGraph
            var lineGraph = gRoutes.append("path")
                .attr("class", "route")
                .attr("d", route.path)
                .attr("stroke-width", 2)

            // push lineGraph to array routes_paths
            routes_paths.push(lineGraph);


            compareRouteWithCollection(route, routes_collection);



            // Transform routes into lines
            setTimeout(function() {

                // Distance
                var line = gLines.append("path")
                    .attr("class", "distance")
                    .attr("d", route.path)
                    .attr("stroke-width", 4)

                var linePath = morphpath.linify(route.path, 0, 10, (0.85*window.innerHeight)+10+(lines_paths.length*linePadding));

                line
                    .transition()
                    .duration(2000)
                    // .attr("transform","translate(0,150)")
                    .attr("d", linePath);

                // Time
                var time = gLines.append("path")
                    .attr("class", "time")
                    .attr("d", route.path)
                    .attr("stroke-width", 4)

                var timePath = morphpath.linify(route.path, 0, 10, (0.85*window.innerHeight)+10+(lines_paths.length*linePadding), parseInt(route.travelTime));

                //console.log(timePath);
                time
                    .transition()
                    .duration(2000)
                    .attr("transform","translate(0,5)")
                    .attr("d", timePath);

                lines_paths.push(linePath);

            }, 1000);

            update();

        }

    }



    function update() {

        for (var i = 0; i < routes_paths.length; i++) {
            routes_paths[i]
                .attr("d", lineFunction(pathData));
        }

        for (var i = 0; i < routes_points.length; i++) {
            routes_points[i]
                .attr({
                    cx: function(d) { return project(d).x; },
                    cy: function(d) { return project(d).y; },
                });
        }

        for (var i = 0; i < routes_foot_paths.length; i++) {
            routes_foot_paths[i]
                .attr("d", lineFunction(pathFootData));
        }

        for (var i = 0; i < routes_foot_points.length; i++) {
            routes_foot_points[i]
                .attr({
                    cx: function(d) { return project(d).x; },
                    cy: function(d) { return project(d).y; },
                });
        }

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

    //
    map.on("viewreset", update);


    map.on("movestart", function() {
        //svg.classed("hidden", true);
    });

    map.on("moveend", function() {
        update();
        //svg.classed("hidden", false);
    });

    //初期レンダリング
    update();

    // Use MapboxGL projection for d3 features
    function project(d) {
        return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
    }


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
        } else if (layer == 'fos-outdoor') {
            map.setStyle('mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft');
        } else {
            map.setStyle('mapbox://styles/mapbox/' + layer);
        }

        map.on('load', function () {
            drawFOSLines();
        });
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


// Transform data from HERE API
function transformHEREgeometry(pathData) {

    for (var i=0; i<pathData.length; i++) {
        pathData[i] = pathData[i].split(",");
        for (var j=0; j<pathData[i].length; j++) {
            pathData[i][j] = parseFloat(pathData[i][j]);
        }
        var temp = pathData[i][0];
        pathData[i][0] = pathData[i][1];
        pathData[i][1] = temp;
    }

    return pathData;
}

// Returns overlapping geometry of two path arrays of points of a line
function getOverlappingGeometry(geometry1, geometry2) {

    var overlappingGeometry = [];

    for (var i=0; i<geometry1.length; i++) {
        for (var j=0; j<geometry2.length; j++) {
            if (geometry1[i].equals(geometry2[j])) {
                overlappingGeometry.push(geometry1[i]);
            }
        }
    }

    return overlappingGeometry;

}



// Warn if overriding existing method
if(Array.prototype.equals) {
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});






function compareRouteWithCollection(r, c) {
    if (c.length > 1) {
        for (var i=0; i<c.length; i++) {
            if (r.id !== c[i].id) {
                var overlapping_route = getOverlappingGeometry(r.geometry, c[i].geometry);
                if (overlapping_route.length>0) {
                    var test123 = gRoutes.append("path")
                        .attr("class", "route")
                        .attr("d", lineFunction(overlapping_route))
                        .attr("stroke-width", 8)
                    routes_paths.push(test123);
                }
            }
        }
    }
}






function setMode(mode) {
    d3.selectAll("button.mode").classed("active", false);
    currentMode = mode;
    d3.select("."+mode).classed("active", true);
}
