// @codekit-prepend "js/digenti-framework.js"
// @codekit-prepend "api.js"


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

var routing_history = [];
var routes_collection = [];
var map_data_sources = [];
var map_data_layers = [];
var knotpoints = [];
var overlapping_routes = [];
var lineFunction, gRouteParts, gSM, currentMode, map;
var routes_geo = [];
var routesArray = [];
var routesJSON = {};
routesJSON.routes = [];

var resultingGEOJSON = {};
resultingGEOJSON.type = "FeatureCollection";
resultingGEOJSON.features = [];

// CONFIG ARRAY
var config  = {};
config.view = "";









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

    // Add data layers at style load
    map.on('style.load', function () {

        // Areas
        /*var sourcePlacesObj = new mapboxgl.GeoJSONSource({ data: geojson });
        map.addSource('places', sourcePlacesObj);
        map.addLayer({
            "id": "places",
            "interactive": true,
            "type": "circle",
            "source": "places",
            "paint": {
                "circle-radius": 8,
                "circle-opacity": 0.3,
                "circle-color": "#f00"
            }
        });*/

        $.each(map_data_sources, function(index, source) {
            map.addSource(source[0], source[1]);
        });

        $.each(map_data_layers, function(index, layer) {
            map.addLayer(layer);
        });

    });


    function addLayer(name, layerID) {

        var layers = document.getElementById('switch');
        var div = document.createElement('div');
        layers.appendChild(div);

        // Add checkbox and label elements for the layer.
          var input = document.createElement('input');
          input.type = 'checkbox';
          input.id = layerID;
          input.checked = true;
          div.appendChild(input);

          var label = document.createElement('label');
          label.setAttribute('for', layerID);
          label.textContent = name;
          div.appendChild(label);

          // When the checkbox changes, update the visibility of the layer.
          input.addEventListener('change', function(e) {
              map.setLayoutProperty(layerID, 'visibility',
                  e.target.checked ? 'visible' : 'none');
          });
    }




    // MapboxGL container
    var container = map.getCanvasContainer();

    // d3 canvas
    var svg = d3.select(container).append("svg").attr("class", "map-features");

    gRouteParts = svg.append("g").attr("class", "routeparts");
    gSM = svg.append("g").attr("class", "smallmultiples");


    gSM
        .selectAll("circle")
        .data(geojson.features)
        .enter()
        .append("g")
            .attr("data-id", function(d) { return d.properties.osm_id; })
            .append("circle")
                .attr({
                    "r": 8
                })
                .attr("class", "village")
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


    triggerMapView();


    // This callback is called when clicking on a location
    function click(d) {}


    gSM.selectAll("g").each(function(d) {

        var current_el = d3.select(this);
        var coord_valledupar = "10.471667,-73.25";
        var coord_end = (d.geometry.coordinates[1]+","+d.geometry.coordinates[0]);
        routingCar(coord_valledupar, coord_end, current_el.attr("data-id"));

    });

    function routingCar(start, end, placeID) {

        // set parametes for API-call
        var routeRequestParams = {
                mode: 'fastest;car',
                representation: 'display',
                routeattributes: 'waypoints,summary,shape,legs',
                maneuverattributes: 'direction,action',
                waypoint0: start, // start
                waypoint1: end, // finish
                returnelevation: 'true'
            };

        // case of error (hopefully not…)
        function onError(e) { console.log(e); }

        function processRoute(route) {

            // Add route path to svg
            gSM.selectAll("g[data-id='"+route.id+"']")
                .append("path")
                .attr("data-id", route.id)
                .attr("data-traveltime", route.travelTime)
                .attr("class", "route")
                .attr("d", route.path)
                .attr("stroke-width", 2);

            // push route geometry to routes_geo-Array
            routes_geo[route.id] = route.geometry;

            // push route to collection-array and compare it with existing routes
            routes_collection.push(route);
            //compareRouteWithCollection(route, routes_collection);

            update(500);

        }

        // succeeded!
        function onSuccess(r) {

            // initialize route from response
            var route = {
                    init: function() {
                        this.id = placeID;
                        this.geometry = transformHEREgeometry(r.response.route[0].shape);
                        this.travelTime = r.response.route[0].summary.travelTime;
                        this.path = lineFunction(this.geometry);
                        return this;
                    }
                }.init();

            var routeasjson = {};
            routeasjson.id = placeID;
            routeasjson.route = route;
            routesJSON.routes.push(routeasjson);

            processRoute(route);

        }

        if (routesJSON.routes.length > 0) {
        //if (false) {

            console.log("ROUTING CACHED");
            processRoute(routesArray[placeID]);

        } else {
            // call API
            console.log("ROUTING VIA API");
            router.calculateRoute(routeRequestParams, onSuccess, onError);
        }

    }


    // Map functions
    map.on("viewreset", update);
    map.on("moveend", update);
    map.on("move", update);

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


    // c = collection of existing routes
    // r = new route to add
    function compareRouteWithCollection(r, c) {

        //pushToKnotpoint(r.geometry[0]);
        //pushToKnotpoint(r.geometry[r.geometry.length-1]);

        // there are several routes in the collection
        if (c.length > 1) {

            // there are existing routes
            // for all existing routes
            for (var i=0; i<c.length; i++) {

                // current route is equal to current route in collection
                if (r.id !== c[i].id) {

                    var overlapping_route = getOverlappingGeometry(r.geometry, c[i].geometry);

                    if (overlapping_route.length>0) {

                        var test = overlapping_route.length.toString().concat(overlapping_route[0][0].toString()).concat(overlapping_route[0][1].toString());

                        var overlapping_route_exists = false;
                        for (var j=0; j<overlapping_routes.length; j++) {
                            if (overlapping_routes[j] === test) {
                                overlapping_route_exists = true;
                                break;
                            }
                        }

                        if (!overlapping_route_exists) {

                            overlapping_routes.push(test);

                            pushToKnotpoint(overlapping_route[0]);
                            pushToKnotpoint(overlapping_route[overlapping_route.length-1]);
                            var feature = {};
                            feature.type = "Feature";
                            feature.geometry = {};
                            feature.geometry.type = "LineString";
                            feature.geometry.coordinates = overlapping_route;
                            feature.properties = {};
                            resultingGEOJSON.features.push(feature);

                        }

                    }


                }
            }
        }
    }




    function pushToKnotpoint(point) {

        var enable_push = true;

        for (var i=0; i<knotpoints.length; i++) {

            var point_equals = true;
            for (var j=0; j<point.length-1; j++) {
                if (knotpoints[i][j] !== point[j]) { point_equals = false; }
            }

            if (point_equals) {
                enable_push = false;
            }

        }

        if (enable_push) {

            /*kps.append("circle")
                    .attr({ "r": 8 })
                    .attr("class", "knotpoint")
                    .attr("data-coord-x", point[0])
                    .attr("data-coord-y", point[1])
                    .attr("cx", function() { return project(point).x; } )
                    .attr("cy", function() { return project(point).y; } );

            knotpoints.push(point);*/

        }

    }


}







function update(transition_time) {


    if (config.view === "smallmultiples") {

        // RENDERING OF SMALL MULTIPLES VIEW

        console.log("triggerSmallMultiplesView");

        var ix = 0;
        var iy = 0;
        var rows = 7;
        var cols = 6;

        //var gap_hor = (w*0.8)/(cols+1);
        var gap_ver = 20;

        var max_path_w = 0;
        var max_path_h = 0;


        gSM.selectAll("g").each(function() {
            var bbox = d3.select(this).node().getBBox();
            var current_path_w = bbox.width;
            var current_path_h = bbox.height;
            if (current_path_h>max_path_h) { max_path_h = current_path_h; }
            if (current_path_w>max_path_w) { max_path_w = current_path_w; }
        });

        var widthperelement = w*0.8/(cols);
        var heightperelement = h/(rows)-gap_ver;

        var gap_left = w*0.2;

        var faktor_height = heightperelement/max_path_h;
        var faktor_width = widthperelement/max_path_w;

        var scaleFactor = faktor_height;
        if (faktor_width<scaleFactor) { scaleFactor=faktor_width; }

        gSM.selectAll("g").each(function(d, i) {

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
                    });

        });

        gSM.selectAll("g").each(function() {

            var current_el = d3.select(this);

            current_el.selectAll("path")
                .transition()
                .duration(transition_time)
                    .attr("stroke-width", function() { return 2/scaleFactor; });

            current_el.selectAll("circle")
                .transition()
                .duration(transition_time)
                    .attr({ "r": 4/scaleFactor });

        });

        setMapOpacity(0.08);
        disableMapInteraction();


    } else {

        setMapOpacity(1);
        enableMapInteraction();

        gSM.selectAll("g").each(function() {

            var current_el = d3.select(this);

            current_el
                .transition()
                .duration(transition_time)
                    .style("opacity", 1)
                    .attr("stroke-width", 2)
                    .attr("transform", function() {
                        return "";
                    });

            current_el.selectAll("path")
                .each(function() {
                    var current_path = d3.select(this);
                    current_path.attr("d", lineFunction(routes_geo[current_path.attr("data-id")]));
                })
                .transition()
                .duration(transition_time)
                    .attr("stroke-width", function() { return 2; });

            current_el.selectAll("circle")
                .attr({
                    cx: function(d) { return project(d.geometry.coordinates).x; },
                    cy: function(d) { return project(d.geometry.coordinates).y; },
                })
                .transition()
                .duration(transition_time)
                    .attr({ "r": 8 });

        });

    }

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









////////////////
// Math Utils
////////////////







function enableMapInteraction() {
    map.scrollZoom.enable();
    map.dragPan.enable();
}

function disableMapInteraction(m) {
    map.scrollZoom.enable();
    map.dragPan.enable();
}






function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}
