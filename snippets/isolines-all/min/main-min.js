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

var concaveman = require("concaveman");

var map, svg, gVillages, path;

var currentMode = "isoline-all", view = "mode";

var places_aoi;

var circleRadius = 5;

var isolinesLoaded = 0;

var isolineColor = "#3dc8e7";

isolineOpacity = .35;

d3.json("../../data/places_aoi.json", function(err, data) {
    places_aoi = data;
    mapDraw(data);
});

function mapDraw(geojson) {
    mapboxgl.accessToken = "pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A";
    map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi",
        zoom: 11,
        center: [ -73.06, 10.41 ]
    });
    map.addControl(new mapboxgl.Navigation());
    map.on("load", function() {
        isolineAll();
    });
    var container = map.getCanvasContainer();
    svg = d3.select(container).append("svg").attr("id", "map-features");
    var transform = d3.geo.transform({
        point: projectPoint
    });
    path = d3.geo.path().projection(transform);
    gVillages = svg.append("g").attr("class", "villages").selectAll("circle").data(geojson.features).enter().append("g").attr("data-id", function(d) {
        return d.properties.osm_id;
    }).attr("class", "village-group").append("circle").attr({
        r: circleRadius
    }).attr("class", "village").attr("data-id", function(d) {
        return d.properties.osm_id;
    }).on("click", function(d) {
        d3.select(this).classed("selected", true);
        var objectID = d3.select(this).attr("data-id");
        click(d, objectID);
    });
    function click(d, objectID) {
        var coordinates = d.geometry.coordinates;
        if (currentMode === "isoline" || currentMode === "isoline-all") {
            getIsoline(coordinates, objectID);
        }
    }
    function getIsoline(coordinates, objectID) {
        var coords = coordinates[1] + "," + coordinates[0], range = parseInt($("#range__slider").val());
        var uri = "http://localhost:61002/api/isoline/" + coords + "/" + range;
        var onIsolineResult = function(result) {
            isolinesLoaded++;
            var polygon = result;
            polygon.properties.objectID = objectID;
            var settlementPoint = {
                type: "Feature",
                properties: {
                    "marker-color": "#f00"
                },
                geometry: {
                    type: "Point",
                    coordinates: coordinates
                }
            };
            var polygonBuffered = turf.buffer(polygon, 500, "meters");
            var isInside = turf.inside(settlementPoint, polygonBuffered.features[0]);
            if (isInside) {
                map.addSource(objectID, {
                    type: "geojson",
                    data: polygon
                });
                map.addLayer({
                    id: "isoline_" + objectID,
                    type: "fill",
                    source: objectID,
                    layout: {},
                    paint: {
                        "fill-color": isolineColor,
                        "fill-opacity": isolineOpacity
                    }
                });
                var isoline = svg.select('g[data-id="' + objectID + '"]').append("path").data([ polygon ]).attr("class", "isoline").attr("data-id", objectID);
            }
            if (isolinesLoaded == places_aoi.features.length) {
                update();
                activateButtons();
            }
        };
        $.ajax({
            dataType: "json",
            url: uri,
            success: onIsolineResult,
            error: function(error) {
                alert(error);
            }
        });
    }
    map.on("viewreset", update);
    map.on("movestart", function() {
        svg.classed("hidden", true);
    });
    map.on("moveend", function() {
        update();
        svg.classed("hidden", false);
    });
    update();
}

function update(transition_time) {
    transition_time = typeof transition_time === undefined ? 0 : transition_time;
    w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if (view === "smallmultiples") {
        console.log("triggerSmallMultiplesView");
        var ix = 0;
        var iy = 0;
        var rows = 7;
        var cols = 6;
        var gap_hor = w * .8 / (cols + 1);
        var gap_ver = 20;
        var max_path_w = 0;
        var max_path_h = 0;
        svg.selectAll(".village-group").each(function(d, i) {
            console.log("village: " + i);
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
        console.log("max_path_w: " + max_path_w);
        console.log("max_path_h: " + max_path_h);
        var scaleFactor = faktor_height;
        if (faktor_width < scaleFactor) {
            scaleFactor = faktor_width;
        }
        svg.selectAll(".village-group").each(function(d, index) {
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
            }).selectAll("path").attr("stroke-width", function() {
                return 2 / scaleFactor;
            });
            current_el.selectAll("circle").transition().delay(transition_time / 6).duration(transition_time).attr({
                r: 4 / scaleFactor
            });
        });
        setMapOpacity(.08);
    } else {
        svg.selectAll(".village").attr({
            cx: function(d) {
                return project(d.geometry.coordinates).x;
            },
            cy: function(d) {
                return project(d.geometry.coordinates).y;
            }
        });
        svg.selectAll(".isoline").each(function(d, index) {
            var isoline = d3.select(this);
            isoline.attr("d", path);
        });
        svg.selectAll(".village-group").each(function(d, i) {
            var current_el = d3.select(this);
            current_el.transition().duration(transition_time).attr("transform", "");
            current_el.selectAll("circle").transition().delay(transition_time / 100).duration(transition_time).attr({
                r: circleRadius
            });
        });
        setMapOpacity(1);
    }
    console.log("UPDATE");
}

function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}

function projectPoint(lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    this.stream.point(point.x, point.y);
}

var basemap_select = document.getElementById("basemap_select");

var basemap_select_options = basemap_select.options;

basemap_select.onchange = function() {
    var selectedValue = basemap_select_options[basemap_select.selectedIndex].value;
    switchLayer(selectedValue);
};

function switchLayer(layer) {
    if (layer == "DIGENTI") {
        map.setStyle("mapbox://styles/jorditost/cipseaugm001ycunimvr00zea");
    } else if (layer == "DIGENTI-Light") {
        map.setStyle("mapbox://styles/jorditost/ciqc61l3p0023dunqn9e5t4zi");
    } else if (layer == "DIGENTI-Dark") {
        map.setStyle("mapbox://styles/jorditost/cir1xojwe0020chknbi0y2d5t");
    } else if (layer == "fos-outdoor") {
        map.setStyle("mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft");
    } else {
        map.setStyle("mapbox://styles/mapbox/" + layer);
    }
}

function showValue() {
    var val = $("#range__slider").val();
    document.getElementById("range").innerHTML = val + " minutes";
}

showValue();

function reorderSmallMultiples(ob) {
    orderby = ob;
    d3.selectAll(".orderby").classed("active", false);
    d3.selectAll("." + orderby).classed("active", true);
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
    d3.selectAll(".mapboxgl-canvas").transition().duration(500).style("opacity", value);
    d3.selectAll(".mapboxgl-control-container").transition().duration(500).style("opacity", value);
}

function activateButtons() {
    d3.selectAll(".disabled").attr("disabled", null);
}

function setMode(mode) {
    d3.selectAll("button.mode").classed("active", false);
    currentMode = mode;
    d3.select("." + mode).classed("active", true);
}

function isolineAll() {
    setMode("isoline-all");
    $(".village").each(function(index) {
        $(this).d3Click();
    });
}

$.fn.d3Click = function() {
    this.each(function(i, e) {
        var evt = new MouseEvent("click");
        e.dispatchEvent(evt);
    });
};