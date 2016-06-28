/* #############
        HERE CONFIG
   ############# */

var platform = new H.service.Platform({
  'app_id': 'EOg7UyuSFbPF0IG5ANjz',
  'app_code': 'iRnqNl0dyzX_8FOlchD0ZQ'
});

// Get an instance of the normal routing service:
var router = platform.getRoutingService();
// Get an instance of the enterprise routing service:
var enterpriseRouter = platform.getEnterpriseRoutingService();






function showValue() {
    var val = $("#range__slider").val();
	document.getElementById("range").innerHTML = val + " minutes";
}

showValue();










var places_aoi;
var places_aoi_street_distance = {
   "type":"FeatureCollection",
   "crs":{
      "type":"name",
      "properties":{
         "name":"urn:ogc:def:crs:OGC:1.3:CRS84"
      }
   },
   "features":[]
};



d3.json("../../data/places_aoi.json", function(err, data) {
    mapDraw(data);
    places_aoi = data;
    console.log(places_aoi);
});



/* #############
        VARS
   ############# */

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
var map_data_sources = [];
var map_data_layers = [];
var map;









function mapDraw(geojson) {

    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jorditost/cipseaugm001ycunimvr00zea',
        //style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 11,
        center: [-73.02, 10.410]
    });

    map.addControl(new mapboxgl.Navigation());

    // Add data layers at style load
    map.on('style.load', function () {

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


        // We are in isonline mode
        if (currentMode === "isoline") {
            getIsoline(coordinates, objectID);
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
        } else if (layer == 'fos-outdoor') {
            map.setStyle('mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft');
        } else {
            map.setStyle('mapbox://styles/mapbox/' + layer);
        }
    }


}




////////////////
// Math Utils
////////////////



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








function setMode(mode) {
    d3.selectAll("button.mode").classed("active", false);
    currentMode = mode;
    d3.select("."+mode).classed("active", true);
}





function getIsoline(coordinates, objectID, feature) {

    var json_result;
    var range = parseInt($("#range__slider").val());
    var rangeforAPI = (range*1000).toString();

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


    // Define a callback function to process the isoline response.
    var onIsolineResult = function(result) {

        var coordArray = transformHEREgeometry(result.Response.isolines[0].value);

        var poly = {
          "type": "Feature", "properties": { "objectID": objectID },
          "geometry": { "type": "Polygon", "coordinates": [coordArray] }
        };
        var poly_buffered = turf.buffer(poly, 0, "meters");

        var current_point = {
          "type": "Feature", "properties": { "marker-color": "#f00" },
          "geometry": { "type": "Point", "coordinates": coordinates }
        };

        var isInside = turf.inside(current_point, poly_buffered.features[0]);

        if (isInside) { // Point is Inside Polygon, Point is connected to street

            var s = [objectID+"-"+range, {
                'type': 'geojson',
                'data': poly
            }];

            var l = {
                'id': 'isoline_'+objectID+"-"+range,
                'type': 'fill',
                'source': objectID+"-"+range,
                'layout': {},
                'paint': {
                    'fill-color': '#088',
                    'fill-opacity': 0.1
                }
            };

            map_data_sources.push(s);
            map_data_layers.push(l);
            map.addSource(s[0], s[1]);
            map.addLayer(l);

            json_result = {
                "touches_street": true,
                "distance_to_street": 0,
                "nearest_point": coordinates
            };


        } else {  // Point is not Inside Polygon and therefor not connected to street

            // Transform points of polygons to turf-FeatureCollection (fc)
            var point_array = [];
            for (var i=0; i<coordArray.length; i++) {
                point_array.push(turf.point(coordArray[i]));
            }
            var fc = turf.featurecollection(point_array);

            // get the neareast point
            var nearest_point = turf.nearest(current_point, fc);
            var distance = turf.distance(current_point, nearest_point, "kilometers");

            json_result = {
                "touches_street": false,
                "distance_to_street": distance*1000,
                "nearest_point": nearest_point.geometry.coordinates
            };

        }

        feature.properties.connections = json_result;
        places_aoi_street_distance.features.push(feature);

        if (places_aoi_street_distance.features.length === 42) {
            var s = JSON.stringify(places_aoi_street_distance);
            //window.location =
            OpenInNewTab('data:text/plain;charset=utf-8,'+encodeURIComponent(s));
        }


    };

    // Call the Enterprise Routing API to calculate an isoline:
    enterpriseRouter.calculateIsoline(
        routingParams,
        function(d) { onIsolineResult(d); },
        function(error) { alert(error.message); }
    );


}






function isolineAll() {

    for (var i=0; i<places_aoi.features.length; i++) {
        var current_feature = places_aoi.features[i];
        getIsoline(current_feature.geometry.coordinates, current_feature.properties.osm_id, current_feature);
    }

}



function OpenInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}
