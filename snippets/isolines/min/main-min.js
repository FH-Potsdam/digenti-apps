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

var currentMode;

var isolineColor = "#3dc8e7";

isolineOpacity = .35;

d3.json("../../data/places_aoi.json", function(err, data) {
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
    map.on("load", function() {});
    var container = map.getCanvasContainer();
    svg = d3.select(container).append("svg").attr("id", "map-features");
    var transform = d3.geo.transform({
        point: projectPoint
    });
    path = d3.geo.path().projection(transform);
    gVillages = svg.append("g").attr("class", "villages").selectAll("circle").data(geojson.features).enter().append("g").attr("data-id", function(d) {
        return d.properties.osm_id;
    }).append("circle").attr({
        r: 5
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
                update();
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

function update() {
    console.log("UPDATE");
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