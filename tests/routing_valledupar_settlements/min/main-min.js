function OpenInNewTab(url) {
    var win = window.open(url, "_blank");
    win.focus();
}

if (Array.prototype.equals) {
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}

Array.prototype.equals = function(array) {
    if (!array) {
        return false;
    }
    if (this.length != array.length) {
        return false;
    }
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i])) {
                return false;
            }
        } else if (this[i] !== array[i]) {
            return false;
        }
    }
    return true;
};

Object.defineProperty(Array.prototype, "equals", {
    enumerable: false
});

function generateUniqueID() {
    return "id" + new Date().getTime().toString() + Math.random().toString(36).substr(2, 16);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function transformHEREgeometry(pathData) {
    for (var i = 0; i < pathData.length; i++) {
        pathData[i] = pathData[i].split(",");
        for (var j = 0; j < pathData[i].length; j++) {
            pathData[i][j] = parseFloat(pathData[i][j]);
        }
        var temp = pathData[i][0];
        pathData[i][0] = pathData[i][1];
        pathData[i][1] = temp;
    }
    return pathData;
}

function getGEOJSON(geojson) {
    var s = JSON.stringify(geojson);
    OpenInNewTab("data:text/plain;charset=utf-8," + encodeURIComponent(s));
}

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var platform = new H.service.Platform({
    app_id: "EOg7UyuSFbPF0IG5ANjz",
    app_code: "iRnqNl0dyzX_8FOlchD0ZQ"
});

var router = platform.getRoutingService();

var enterpriseRouter = platform.getEnterpriseRoutingService();

$.fn.d3Click = function() {
    this.each(function(i, e) {
        var evt = new MouseEvent("click");
        e.dispatchEvent(evt);
    });
};

var linePadding = 15;

d3.json("../../data/places_aoi.json", function(err, data) {
    mapDraw(data);
});

var routes_points = [];

var routes_paths = [];

var lines_paths = [];

var routing_history = [];

var pathData, pathFootData;

var routes_collection = [];

var gRoutes, lineFunction;

var currentMode, isoline;

var map_data_sources = [];

var map_data_layers = [];

var knotpoints = [];

var kps;

var routes_geo = new Array();

function mapDraw(geojson) {
    mapboxgl.accessToken = "pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A";
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/outdoors-v9",
        zoom: 11,
        center: [ -73.02, 10.41 ]
    });
    map.addControl(new mapboxgl.Navigation());
    map.on("style.load", function() {
        var sourcePlacesObj = new mapboxgl.GeoJSONSource({
            data: geojson
        });
        map.addSource("places", sourcePlacesObj);
        map.addLayer({
            id: "places",
            interactive: true,
            type: "circle",
            source: "places",
            paint: {
                "circle-radius": 8,
                "circle-opacity": .3,
                "circle-color": "#f00"
            }
        });
        $.each(map_data_sources, function(index, source) {
            map.addSource(source[0], source[1]);
        });
        $.each(map_data_layers, function(index, layer) {
            map.addLayer(layer);
        });
    });
    function addLayer(name, layerID) {
        var layers = document.getElementById("switch");
        var div = document.createElement("div");
        layers.appendChild(div);
        var input = document.createElement("input");
        input.type = "checkbox";
        input.id = layerID;
        input.checked = true;
        div.appendChild(input);
        var label = document.createElement("label");
        label.setAttribute("for", layerID);
        label.textContent = name;
        div.appendChild(label);
        input.addEventListener("change", function(e) {
            map.setLayoutProperty(layerID, "visibility", e.target.checked ? "visible" : "none");
        });
    }
    var container = map.getCanvasContainer();
    var svg = d3.select(container).append("svg").attr("class", "map-features");
    gRoutes = svg.append("g").attr("class", "routes");
    kps = svg.append("g").attr("class", "knotpoints");
    var featureElement = svg.append("g").attr("class", "villages").selectAll("circle").data(geojson.features).enter().append("circle").attr({
        r: 8
    }).attr("class", "village").attr("data-id", function() {
        return generateUniqueID();
    }).on("click", function(d) {
        d3.select(this).classed("selected", true);
        var objectID = d3.select(this).attr("data-id");
        click(d, objectID);
    });
    lineFunction = d3.svg.line().x(function(d) {
        return project(d).x;
    }).y(function(d) {
        return project(d).y;
    }).interpolate("linear");
    function click(d, objectID) {
        var coordinates = d.geometry.coordinates;
        if (currentMode === "routing") {
            routing_history.push(coordinates[1] + "," + coordinates[0]);
            routingCar(coordinates);
        }
    }
    featureElement.each(function(d, i) {
        var coord_valledupar = "10.471667,-73.25";
        var coord_end = d.geometry.coordinates[1] + "," + d.geometry.coordinates[0];
        routingCar(coord_valledupar, coord_end);
    });
    function routingCar(start, end) {
        var routeRequestParams = {
            mode: "fastest;car",
            representation: "display",
            routeattributes: "waypoints,summary,shape,legs",
            maneuverattributes: "direction,action",
            waypoint0: start,
            waypoint1: end,
            returnelevation: "true"
        };
        router.calculateRoute(routeRequestParams, onSuccess, onError);
        function onError(e) {
            console.log(e);
        }
        function onSuccess(r) {
            var response = r.response;
            var route = {
                init: function() {
                    this.id = generateUniqueID();
                    this.geometry = transformHEREgeometry(response.route[0].shape);
                    this.travelTime = response.route[0].summary.travelTime;
                    this.path = lineFunction(this.geometry);
                    return this;
                }
            }.init();
            routes_collection.push(route);
            var lineGraph = gRoutes.append("path").attr("data-id", route.id).attr("class", "route").attr("d", route.path).attr("stroke-width", 2);
            routes_geo[route.id] = route.geometry;
            routes_paths.push(lineGraph);
            compareRouteWithCollection(route, routes_collection);
            update();
        }
    }
    function update() {
        if (routes_paths.length > 0) {
            var test = routes_paths.length;
            for (var i = 0; i < test; i++) {}
        }
        if (routes_points.length > 0) {
            for (var i = 0; i < routes_points.length; i++) {
                routes_points[i].attr({
                    cx: function(d) {
                        return project(d).x;
                    },
                    cy: function(d) {
                        return project(d).y;
                    }
                });
            }
        }
        gRoutes.selectAll("path").each(function(d, i) {
            var el = d3.select(this);
            console.log(el.attr("data-id"));
        });
        kps.selectAll("circle").each(function(d, i) {
            var el = d3.select(this);
            el.attr({
                cx: function() {
                    return project([ el.attr("data-coord-x"), el.attr("data-coord-y") ]).x;
                },
                cy: function() {
                    return project([ el.attr("data-coord-x"), el.attr("data-coord-y") ]).y;
                }
            });
        });
        featureElement.attr({
            cx: function(d) {
                return project(d.geometry.coordinates).x;
            },
            cy: function(d) {
                return project(d.geometry.coordinates).y;
            }
        });
        console.log("UPDATE");
    }
    map.on("viewreset", update);
    map.on("moveend", update);
    update();
    function project(d) {
        return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
    }
    var basemap_select = document.getElementById("basemap_select");
    var basemap_select_options = basemap_select.options;
    basemap_select.onchange = function() {
        var selectedValue = basemap_select_options[basemap_select.selectedIndex].value;
        switchLayer(selectedValue);
    };
    function switchLayer(layer) {
        if (layer === "DIGENTI") {
            map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea");
        } else if (layer === "fos-outdoor") {
            map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft");
        } else {
            map.setStyle("mapbox://styles/mapbox/" + layer);
        }
    }
    function getOverlappingGeometry(geometry1, geometry2) {
        var overlappingGeometry = [];
        for (var i = 0; i < geometry1.length; i++) {
            for (var j = 0; j < geometry2.length; j++) {
                if (geometry1[i].equals(geometry2[j])) {
                    overlappingGeometry.push(geometry1[i]);
                }
            }
        }
        return overlappingGeometry;
    }
    function compareRouteWithCollection(r, c) {
        pushToKnotpoint(r.geometry[0]);
        pushToKnotpoint(r.geometry[r.geometry.length - 1]);
        if (c.length > 1) {
            for (var i = 0; i < c.length; i++) {
                if (r.id !== c[i].id) {
                    var overlapping_route = getOverlappingGeometry(r.geometry, c[i].geometry);
                    if (overlapping_route.length > 0) {
                        pushToKnotpoint(overlapping_route[0]);
                        pushToKnotpoint(overlapping_route[overlapping_route.length - 1]);
                        var test123 = gRoutes.append("path").attr("class", "route").attr("d", lineFunction(overlapping_route)).attr("stroke-width", 8);
                        routes_paths.push(test123);
                    }
                }
            }
        }
    }
    function pushToKnotpoint(point) {
        var enable_push = true;
        for (var i = 0; i < knotpoints.length; i++) {
            var point_equals = true;
            for (var j = 0; j < point.length - 1; j++) {
                if (knotpoints[i][j] !== point[j]) {
                    point_equals = false;
                }
            }
            if (point_equals) {
                enable_push = false;
            }
        }
        if (enable_push) {
            var pt1 = turf.point([ -point[0], point[1] ]);
            console.log(pt1);
            kps.append("circle").attr({
                r: 8
            }).attr("class", "knotpoint").attr("data-coord-x", point[0]).attr("data-coord-y", point[1]).attr("cx", function() {
                return project(point).x;
            }).attr("cy", function() {
                return project(point).y;
            });
            knotpoints.push(point);
        }
    }
}

function uniqueArrayOfArrays(array) {
    var currentI;
    for (var i = 0; i < array.length; i++) {
        var arrayToRemove = [];
        currentI = array[i];
        for (var j = i; j < array.length; j++) {
            var equals = true;
            for (var k = 0; k < currentI.length - 1; k++) {
                if (currentI[k] !== array[j]) {
                    equals = false;
                }
            }
            if (equals) {
                arrayToRemove.push(j);
            }
        }
        for (var j = arrayToRemove.length - 1; j >= 0; j--) {
            array.remove(j);
        }
    }
    return array;
}