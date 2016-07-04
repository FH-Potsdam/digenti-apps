// @codekit-prepend "js/digenti-framework.js"
/*global d3:true */
/*global mapboxgl:true */
/*global turf:true */
/*global console:true */







/* #############
        VARS
   ############# */

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var map, featureElement, svg;
var view = "";
var places_aoi, street_points_aoi;
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
    places_aoi = data;
    d3.json("../../data/street_points_aoi.json", function(err, data2) {
        street_points_aoi = data2;
        mapDraw(places_aoi);
    });
});





function mapDraw(geojson) {

    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jorditost/cipseaugm001ycunimvr00zea',
        zoom: 11,
        center: [-73.02, 10.410]
    });

    map.addControl(new mapboxgl.Navigation());

    // Add data layers at style load
    map.on('style.load', function () {});



    // MapboxGL container
    var container = map.getCanvasContainer();

    // d3 canvas
    svg = d3.select(container).append("svg").attr("class", "map-features");

    featureElement = svg.append("g")
            .attr("class", "villages")
            .selectAll("g")
            .data(geojson.features)
            .enter()
            .append("g")
                .attr("class", "village-group")
                .append("circle")
                    .attr({ "r": 8 })
                    .attr("class", "village")
                    .attr("data-id", function() { return generateUniqueID(); })
                    .on("click", function() {
                        d3.select(this).classed("selected", true);
                        var objectID = d3.select(this).attr("data-id");
                    });


    //
    map.on("viewreset", update);


    map.on("movestart", function() {
        //svg.classed("hidden", true);
    });

    map.on("moveend", function() {
        update(0);
        //svg.classed("hidden", false);
    });


    update(0);

    isolineAll();
    triggerMapDistancesView();



    var basemap_select = document.getElementById('basemap_select');
    var basemap_select_options = basemap_select.options;

    basemap_select.onchange = function() {
        var selectedValue = basemap_select_options[basemap_select.selectedIndex].value;
        switchLayer(selectedValue);
    };

    function switchLayer(layer) {
        if (layer === 'DIGENTI') {
            map.setStyle('mapbox://styles/jorditost/cipseaugm001ycunimvr00zea');
        } else if (layer === 'fos-outdoor') {
            map.setStyle('mapbox://styles/jorditost/cip44ooh90013cjnkmwmwd2ft');
        } else {
            map.setStyle('mapbox://styles/mapbox/' + layer);
        }
    }


}








function getIsoline(coordinates, objectID, feature) {

    var json_result;
    //var range = parseInt($("#range__slider").val());
    //var rangeforAPI = (range*1000).toString();

    var current_point = {
      "type": "Feature", "properties": { "marker-color": "#f00" },
      "geometry": { "type": "Point", "coordinates": coordinates }
    };

    // get the neareast point
    var nearest_point = turf.nearest(current_point, street_points_aoi);
    var distance = turf.distance(current_point, nearest_point, "kilometers");

    if (distance < 0.2) {
        json_result = {
            "touches_street": true,
            "distance_to_street": distance*1000,
            "nearest_point": nearest_point.geometry.coordinates
        };
    } else {  // Point is not Inside Polygon and therefor not connected to street
        json_result = {
            "touches_street": false,
            "distance_to_street": distance*1000,
            "nearest_point": nearest_point.geometry.coordinates
        };
    }

    feature.properties.connections = json_result;
    places_aoi_street_distance.features.push(feature);

    if (places_aoi_street_distance.features.length === places_aoi.features.length) {

        activateButtons();

        places_aoi_street_distance.features.sort(function (a, b) {
            return d3.ascending(a.properties.name, b.properties.name);
        });

        svg.selectAll(".village")
                .data(places_aoi_street_distance.features)
                .attr("data-distance_to_street", function(d) { return d.properties.connections.distance_to_street; })
                .attr("data-touches_street", function(d) { return d.properties.connections.touches_street; })
                .enter();

        svg.selectAll(".village-group").each(function(d) {

            var current_el = d3.select(this);

            current_el.append("line");

            current_el.append("circle")
                .attr({ "r": 4 })
                .attr("class", "road");

            current_el.append("text")
                .text(d.properties.name)
                .style("font-weight", "bold")
                .attr("y", "30");

            current_el.append("text")
                .text("Distance to Street: "+Math.round(d.properties.connections.distance_to_street)+" meter")
                .attr("y", "45");

        });

        update(0);

    }

}






function update(transition_time) {

    w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    if (view === "smallmultiples") {

        var ix = 0;
        var iy = 0;
        var rows = 7;
        var cols = 6;

        var gap_hor = (w*0.8)/(cols+1);
        var gap_ver = (h)/(rows+1);

        var arr = [];
        for (var i=0; i<places_aoi_street_distance.features.length; i++) {
            arr.push(places_aoi_street_distance.features[i].properties.connections.distance_to_street);
        }
        var max = Math.max.apply(null, arr);

        var faktor = (gap_hor*0.8)/(max*2);

        svg.selectAll(".village-group").each(function(d) {

            var current_el = d3.select(this);

            current_el
                .transition()
                //.delay(20 * i)
                .duration(transition_time)
                    .style("opacity", 1)
                    .attr("transform", function() {
                        var x = (w*0.2)+ix*gap_hor+(gap_hor/2);
                        var y = iy*gap_ver+gap_ver;
                        return "translate("+x+","+y+")";
                    });

            current_el.select(".village")
                .transition()
                .duration(transition_time)
                    .attr("cx", function() {
                        var gap = 8;
                        if (d.properties.connections.distance_to_street > 0) { gap = 2*faktor*d.properties.connections.distance_to_street; }
                        return gap;
                    });

            current_el.select(".road")
                .transition()
                .duration(transition_time)
                    .style("opacity", 1)
                    .attr("cy", 0)
                    .attr("cx", function() {
                        var gap = 8;
                        if (d.properties.connections.distance_to_street > 0) { gap = 0; }
                        return gap;
                    });

            current_el.select("line")
                .transition()
                .duration(transition_time)
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 2*faktor*d.properties.connections.distance_to_street)
                    .attr("y2", 0);

            current_el.selectAll("text")
                .attr("x", 0)
                .transition()
                .duration(500)
                    .style("opacity", 1);

            setMapOpacity(0);

            ix++;
            if (ix === cols) { ix = 0; }
            iy++;
            if (iy === rows) { iy = 0; }

        });


    } else if (view === "map_distances") {

        svg.selectAll(".village-group").each(function(d) {

            var current_el = d3.select(this);

            var x1 = project(d.geometry.coordinates).x;
            var y1 = project(d.geometry.coordinates).y;
            var x2 = project(d.properties.connections.nearest_point).x - x1;
            var y2 = project(d.properties.connections.nearest_point).y - y1;

            current_el
                .transition()
                //.delay(20 * i)
                .duration(transition_time)
                    .style("opacity", 0.4)
                    .attr("transform", function() {
                        return "translate("+x1+","+y1+")";
                    });

            current_el.select(".village")
                .transition()
                .duration(transition_time)
                    .attr("cx", function() {
                        return 0;
                    });

            current_el.select(".road")
                .transition()
                .duration(transition_time)
                    .style("opacity", 1)
                    .attr("cx", x2)
                    .attr("cy", y2);

            current_el.select("line")
                .transition()
                .duration(transition_time)
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", x2)
                    .attr("y2", y2);

            current_el.selectAll("text")
                .transition()
                .duration(transition_time)
                    .style("opacity", 0);

            setMapOpacity(1);


        });

    } else {

        svg.selectAll(".village-group").each(function(d) {

            var current_el = d3.select(this);

            var x1 = project(d.geometry.coordinates).x;
            var y1 = project(d.geometry.coordinates).y;

            current_el
                .transition()
                //.delay(20 * i)
                .duration(transition_time)
                    .style("opacity", 0.4)
                    .attr("transform", function() {
                        return "translate("+x1+","+y1+")";
                    });

            current_el.select(".village")
                .transition()
                .duration(transition_time)
                    .attr("cx", function() {
                        return 0;
                    });

            current_el.select(".road")
                .transition()
                .duration(transition_time)
                    .style("opacity", 0);

            current_el.select("line")
                .transition()
                .duration(transition_time)
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", 0);

            current_el.selectAll("text")
                .transition()
                .duration(transition_time)
                    .style("opacity", 0);

            setMapOpacity(1);


        });

    }

    console.log("UPDATE");

}






// Use MapboxGL projection for d3 features
function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}







function isolineAll() {

    for (var i=0; i<places_aoi.features.length; i++) {
        var current_feature = places_aoi.features[i];
        getIsoline(current_feature.geometry.coordinates, current_feature.properties.osm_id, current_feature);
    }

}




/* #####################
   TRIGGER VIEWS
   ##################### */

function triggerSmallMultiplesView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".smallmultiplesview").classed("active", true);
    view = "smallmultiples";
    update(500);
}

function triggerMapView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapview").classed("active", true);
    view = "";
    update(500);
}

function triggerMapDistancesView() {
    d3.selectAll(".view").classed("active", false);
    d3.selectAll(".mapdistancesview").classed("active", true);
    view = "map_distances";
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
