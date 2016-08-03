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

$.fn.d3Click = function() {
    this.each(function(i, e) {
        var evt = new MouseEvent("click");
        e.dispatchEvent(evt);
    });
};

d3.json("../../data/places_aoi.json", function(err, data) {
    mapDraw(data);
});

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var routes_points = [];

var routes_paths = [];

var routing_history = [];

var routes_collection = [];

var map_data_sources = [];

var map_data_layers = [];

var knotpoints = [];

var overlapping_routes = [];

var gRoutes, lineFunction, gRouteParts, gSM, currentMode, kps, view, featureElement, map;

var routes_geo = [];

var resultingGEOJSON = {};

resultingGEOJSON.type = "FeatureCollection";

resultingGEOJSON.features = [];

function mapDraw(geojson) {
    mapboxgl.accessToken = "pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A";
    map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi",
        zoom: 11,
        center: [ -73.02, 10.41 ]
    });
    map.addControl(new mapboxgl.Navigation());
    map.on("style.load", function() {
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
    gRouteParts = svg.append("g").attr("class", "routeparts");
    gSM = svg.append("g").attr("class", "smallmultiples");
    featureElement = svg.append("g").attr("class", "villages").selectAll("circle").data(geojson.features).enter().append("circle").attr({
        r: 8
    }).attr("class", "village").attr("data-id", function(d) {
        return d.properties.osm_id;
    }).on("click", function(d) {
        d3.select(this).classed("selected", true);
        var objectID = d3.select(this).attr("data-id");
        click(d, objectID);
    });
    gSM.selectAll("circle").data(geojson.features).enter().append("g").attr("data-id", function(d) {
        return d.properties.osm_id;
    }).append("circle").attr({
        r: 8
    }).attr("class", "village").on("click", function(d) {
        d3.select(this).classed("selected", true);
        var objectID = d3.select(this).attr("data-id");
        click(d, objectID);
    });
    lineFunction = d3.svg.line().x(function(d) {
        return project(d).x;
    }).y(function(d) {
        return project(d).y;
    }).interpolate("linear");
    triggerMapView();
    function click(d) {
        var coordinates = d.geometry.coordinates;
        if (currentMode === "routing") {
            routing_history.push(coordinates[1] + "," + coordinates[0]);
            routingCar(coordinates);
        }
    }
    featureElement.each(function(d) {
        var current_el = d3.select(this);
        var coord_valledupar = "10.471667,-73.25";
        var coord_end = d.geometry.coordinates[1] + "," + d.geometry.coordinates[0];
        routingCar(coord_valledupar, coord_end, current_el.attr("data-id"));
    });
    function routingCar(start, end, placeID) {
        var routeRequestParams = {
            mode: "fastest;car",
            representation: "display",
            routeattributes: "waypoints,summary,shape,legs",
            maneuverattributes: "direction,action",
            waypoint0: start,
            waypoint1: end,
            returnelevation: "true"
        };
        function onError(e) {
            console.log(e);
        }
        function onSuccess(r) {
            var response = r.response;
            var route = {
                init: function() {
                    this.id = placeID;
                    this.geometry = transformHEREgeometry(response.route[0].shape);
                    this.travelTime = response.route[0].summary.travelTime;
                    this.path = lineFunction(this.geometry);
                    return this;
                }
            }.init();
            routes_collection.push(route);
            gSM.selectAll("g[data-id='" + route.id + "']").append("path").attr("data-id", route.id).attr("data-traveltime", route.travelTime).attr("class", "route").attr("d", route.path).attr("stroke-width", 2);
            routes_geo[route.id] = route.geometry;
            compareRouteWithCollection(route, routes_collection);
            update(500);
        }
        router.calculateRoute(routeRequestParams, onSuccess, onError);
    }
    map.on("viewreset", update);
    map.on("moveend", update);
    update(500);
    var basemap_select = document.getElementById("basemap_select");
    var basemap_select_options = basemap_select.options;
    basemap_select.onchange = function() {
        var selectedValue = basemap_select_options[basemap_select.selectedIndex].value;
        switchLayer(selectedValue);
    };
    function switchLayer(layer) {
        if (layer === "DIGENTI") {
            map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea");
        } else if (layer === "DIGENTI-Light") {
            map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi");
        } else if (layer === "DIGENTI-Dark") {
            map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t");
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
        if (c.length > 1) {
            for (var i = 0; i < c.length; i++) {
                if (r.id !== c[i].id) {
                    var overlapping_route = getOverlappingGeometry(r.geometry, c[i].geometry);
                    if (overlapping_route.length > 0) {
                        var test = overlapping_route.length.toString().concat(overlapping_route[0][0].toString()).concat(overlapping_route[0][1].toString());
                        var overlapping_route_exists = false;
                        for (var j = 0; j < overlapping_routes.length; j++) {
                            if (overlapping_routes[j] === test) {
                                overlapping_route_exists = true;
                                break;
                            }
                        }
                        if (!overlapping_route_exists) {
                            overlapping_routes.push(test);
                            pushToKnotpoint(overlapping_route[0]);
                            pushToKnotpoint(overlapping_route[overlapping_route.length - 1]);
                            var feature = {};
                            feature.type = "Feature";
                            feature.geometry = {};
                            feature.geometry.type = "LineString";
                            feature.geometry.coordinates = overlapping_route;
                            feature.properties = {};
                            feature.properties.prop1 = "test123";
                            resultingGEOJSON.features.push(feature);
                        }
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
        if (enable_push) {}
    }
}

function update(transition_time) {
    if (view === "smallmultiples") {
        console.log("triggerSmallMultiplesView");
        var ix = 0;
        var iy = 0;
        var rows = 7;
        var cols = 6;
        var gap_ver = 20;
        var max_path_w = 0;
        var max_path_h = 0;
        gSM.selectAll("g").each(function() {
            var current_el = d3.select(this);
            var current_path_w = current_el.node().getBBox().width;
            var current_path_h = current_el.node().getBBox().height;
            if (current_path_h > max_path_h) {
                max_path_h = current_path_h;
            }
            if (current_path_w > max_path_w) {
                max_path_w = current_path_w;
            }
        });
        var widthperelement = w * .8 / cols;
        var heightperelement = h / rows - gap_ver;
        var gap_left = w * .2;
        var faktor_height = heightperelement / max_path_h;
        var faktor_width = widthperelement / max_path_w;
        var scaleFactor = faktor_height;
        if (faktor_width < scaleFactor) {
            scaleFactor = faktor_width;
        }
        gSM.selectAll("g").each(function(d, i) {
            var current_el = d3.select(this);
            current_el.transition().duration(transition_time).style("opacity", 1).attr("transform", function() {
                var x = gap_left / scaleFactor + (ix + .5) * (widthperelement / scaleFactor) - current_el.node().getBBox().x - current_el.node().getBBox().width / 2;
                var y = (iy + .5) * ((heightperelement + gap_ver) / scaleFactor) - current_el.node().getBBox().y - current_el.node().getBBox().height / 2;
                ix++;
                if (ix === cols) {
                    ix = 0;
                }
                iy++;
                if (iy === rows) {
                    iy = 0;
                }
                return "scale(" + scaleFactor + ") translate(" + x + "," + y + ")";
            });
        });
        gSM.selectAll("g").each(function() {
            var current_el = d3.select(this);
            current_el.selectAll("path").transition().duration(transition_time).attr("stroke-width", function() {
                return 2 / scaleFactor;
            });
            current_el.selectAll("circle").transition().duration(transition_time).attr({
                r: 4 / scaleFactor
            });
        });
        setMapOpacity(.08);
        gRoutes.transition().duration(transition_time).style("opacity", 0);
        featureElement.transition().duration(transition_time).style("opacity", 0);
    } else {
        setMapOpacity(1);
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
        gSM.selectAll("g").each(function() {
            var current_el = d3.select(this);
            current_el.transition().duration(transition_time).style("opacity", 1).attr("stroke-width", 2).attr("transform", function() {
                return "";
            });
        });
        gSM.selectAll("g").each(function() {
            var current_el = d3.select(this);
            current_el.selectAll("path").transition().duration(transition_time).attr("stroke-width", function() {
                return 2;
            });
            current_el.selectAll("circle").transition().duration(transition_time).attr({
                r: 8
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
        gSM.selectAll("g").selectAll("circle").attr({
            cx: function(d) {
                return project(d.geometry.coordinates).x;
            },
            cy: function(d) {
                return project(d.geometry.coordinates).y;
            }
        });
    }
    console.log("UPDATE");
}

function triggerMapView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapview").classed("active", true);
    d3.selectAll("#orderby").classed("disabled", true);
    view = "";
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
    d3.selectAll(".mapboxgl-canvas").transition().duration(500).style("opacity", value);
    d3.selectAll(".mapboxgl-control-container").transition().duration(500).style("opacity", value);
}

function activateButtons() {
    d3.selectAll(".disabled").attr("disabled", null);
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

function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}

if (Array.prototype.equals) {
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}

Array.prototype.equals = function(array) {
    if (!array) {
        return false;
    }
    if (this.length !== array.length) {
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