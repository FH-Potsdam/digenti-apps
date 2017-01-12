/*global d3:true */
/*global console:true */
/*global app:true */
/*global project:true */
/*global places_aoi:true */
/*global updateSettlementPointLayer:true */
/*global routesJSON:true */
/* exported missingInfrastructureLayer */




//////////////////////////////////
// Missing Infrastructure Layer
//////////////////////////////////

function missingInfrastructureLayer() {

    ///////////
    // Base
    ///////////

    var parent = this;


    ////////////////////////////
    // Variables of the Layer
    ////////////////////////////

    this.places_aoi_street_distance = {
       "type":"FeatureCollection",
       "crs":{
          "type":"name",
          "properties":{
             "name":"urn:ogc:def:crs:OGC:1.3:CRS84"
          }
       },
       "features":[]
    };

    this.missingProfileArray = [];

    // DEPRECATED this.active = true;
    this.factor = 0;
    // position of vis in smallmultiple-container
    this.positionSmallVisY = app.layout.heightperelement - 40;
    this.distance_threshold = 100;


    //////////////////////
    // Functions
    //////////////////////

    /**
     * toogle opacity of the layer
     * @param {state} boolean
     */
     // DEPRECATED
    /*this.setActive = function (state) {

        if (state === null) { this.active = !this.active; }
        else                { this.active = state; }

        this.svglayer.classed('disabled', !this.active);

    };*/



    /**
     * initializes the layer
     * @param {Number} svg
     * @param {geojson} geojson
     */
    this.init = function (svg, geojson) {

        // add new group for this layer to svg
        this.svglayer = svg.append("g").attr("id", "missinginfrastructure");
        // Deactivate this layer by default
        // DEPRECATED this.setActive(true);

        this.villages = this.svglayer.selectAll("g")
                            .data(geojson.features)
                            .enter()
                            .append("g")
                                .attr("class", "village-group")
                                .attr("data-id", function(d) { return d.properties.osm_id; });


        calculateAllDistances();
    };



    /**
     * calcualtes the view of the layer
     */
    this.calc = function () {

        // Small multiples
        if (app.view === "smallmultiples") {

            // counter for rows and cols of single smallmultiple-elements
            var ix = 0;
            var iy = 0;

            // Calculate Faktor for resizing the missing routes length
            var arr = [];
            for (var i=0; i<parent.places_aoi_street_distance.features.length; i++) {
                arr.push(parent.places_aoi_street_distance.features[i].properties.connections.distance_to_street);
            }
            parent.faktor = (app.layout.widthperelement * 0.8) / (Math.max.apply(null, arr) * 2);


            parent.svglayer.selectAll(".village-group").each(function(d) {

                var village_group = d3.select(this);

                if (app.orderby === "distance") {
                    var pos = d.properties.connections.distance_order;
                    iy = Math.floor(pos/app.layout.cols);
                    ix = Math.round(app.layout.cols*((pos/app.layout.cols)-iy));
                }

                var village_group_x = app.layout.offsetLeft + ix*(app.layout.gapX+app.layout.widthperelement);
                var village_group_y = app.layout.offsetTop + iy*(app.layout.gapY+app.layout.heightperelement);

                village_group
                    .attr("data-transformX", village_group_x)
                    .attr("data-transformY", village_group_y);

                var cx = 8;
                if (d.properties.connections.distance_to_street > 0) { cx = 2*parent.faktor*d.properties.connections.distance_to_street; }

                //if (parent.active) {
                    app.villagePositions[village_group.attr("data-id")] = {};
                    app.villagePositions[village_group.attr("data-id")].x = village_group_x + cx;
                    app.villagePositions[village_group.attr("data-id")].y = village_group_y + parent.positionSmallVisY;
                //}

                if (app.orderby === "size") {
                    ix++;
                    if (ix === app.layout.cols) { ix = 0; }
                    iy++;
                    if (iy === app.layout.rows) { iy = 0; }
                }

            });

        }


    };











    /**
     * updates the view of the layer
     * @param {Number} transition_time
     */
    this.update = function (transition_time) {
        this.calc();
        this.render(transition_time);
    };











    /**
     * updates the view of the layer
     * @param {Number} transition_time
     */
    this.render = function (transition_time) {

        // Small multiples
        if (app.view === "smallmultiples") {

            parent.svglayer.selectAll(".village-group").each(function(d) {

                var current_el = d3.select(this);

                if (app.config.layoutdebug === true) {
                    current_el.selectAll(".layoutdebug")
                        .attr("width", app.layout.widthperelement)
                        .attr("height", app.layout.heightperelement);
                }

                current_el
                    .transition()
                    .duration(transition_time)
                        //.style("opacity", 1)
                        .attr("transform", "translate(" + current_el.attr("data-transformX") + "," + current_el.attr("data-transformY") + ")");


                        if (d.properties.connections.distance_to_street > parent.distance_threshold) {

                            current_el.select(".nearest-road")
                                .transition()
                                .duration(transition_time)
                                    //.style("opacity", 1)
                                    .attr("cy", parent.positionSmallVisY)
                                    .attr("cx", 0);

                            current_el.select("line")
                                .transition()
                                .duration(transition_time)
                                    .attr("x1", 0)
                                    .attr("y1", parent.positionSmallVisY)
                                    .attr("x2", 2*parent.faktor*d.properties.connections.distance_to_street)
                                    .attr("y2", parent.positionSmallVisY);


                        }

            });

        // Map with missing infrastructure
        } else {

                parent.svglayer.selectAll(".village-group").each(function(d) {

                    var current_el = d3.select(this);

                    if (d.properties.connections !== undefined) {

                        // console.log("id: " + d.properties.osm_id + ", nearest: " + d.properties.connections.nearest_point);

                        var x1 = project(d.geometry.coordinates).x;
                        var y1 = project(d.geometry.coordinates).y;
                        var x2 = project(d.properties.connections.nearest_point).x - x1;
                        var y2 = project(d.properties.connections.nearest_point).y - y1;

                        current_el
                            .transition()
                            .duration(transition_time)
                            .attr("transform", "translate("+x1+","+y1+")");
                                //.style("opacity", 1);

                        if (d.properties.connections.distance_to_street > parent.distance_threshold) {

                            current_el.select("line")
                                //.style("opacity", 0.5)
                                .transition()
                                .duration(transition_time)
                                    .attr("x1", x2)
                                    .attr("y1", y2)
                                    .attr("x2", 0)
                                    .attr("y2", 0);

                            current_el.select(".nearest-road")
                                .transition()
                                .duration(transition_time)
                                    //.style("opacity", 1)
                                    .attr("cx", x2)
                                    .attr("cy", y2);

                        }

                    }

                });

        }

    };



    /////////////////////////
    // Calculate Distances
    /////////////////////////

    /**
     * Calculate all distances to next road for all settlements
     */
    function calculateAllDistances() {

        for (var i=0; i<places_aoi.features.length; i++) {
            calculateSingleDistance(places_aoi.features[i]);
        }

    }

    /**
     * calculates distance between settlement and nearest road
     */
    function calculateSingleDistance(feature) {

        var json_result;

        var coord_settlement = feature.geometry.coordinates[1]+","+feature.geometry.coordinates[0];

        // console.log("route: " + app.config.apiBase + "/route/" + app.config.coordHomeBase + "/" + coord_settlement);

        $.ajax({
            dataType: "json",
            url: app.config.apiBase + "/route/" + app.config.coordHomeBase + "/" + coord_settlement,
            success: onRouteLoadSuccess,
            error: function(error) {
                console.log(error);
            }
        });

        // Called when loaded
        function onRouteLoadSuccess(r) {

            // Waypoint 1 is the the destionation (0 is origin)
            var nearest_point = r.properties.waypoints[1].mappedPosition;

            // Distance is the distance from the input coordinate (settlement) and the mapped position (nearest point in road)
            var distance = r.properties.waypoints[1].distance;

            // If the distance is below a threshold, we supose it is directly connected to the street
            if (distance < parent.distance_threshold) {
                json_result = {
                    "touches_street": true,
                    "distance_to_street": distance,
                    "nearest_point": nearest_point
                };

            // Point is not Inside Polygon and therefore not connected to street
            } else {
                json_result = {
                    "touches_street": false,
                    "distance_to_street": distance,
                    "nearest_point": nearest_point
                };

                // Load missing profile
                var coord_street = nearest_point[1] + "," + nearest_point[0];

                // console.log("load missing profile – id: " + feature.properties.osm_id + ", name: " + feature.properties.name + ", nearest point: " + coord_street + ", settlement: " + coord_settlement);

                $.ajax({
                    dataType: "json",
                    url: app.config.apiBase + "/profile/points/" + coord_street + "/" + coord_settlement,
                    // success: onMissingProfileLoadSuccess,
                    success: function(response) {
                        // console.log("missing route loaded: " + feature.properties.osm_id);
                        var placeID = feature.properties.osm_id;
                        var isSliced = (response instanceof Array);

                        var missingObj = {};
                        missingObj.id = placeID;
                        missingObj.missing = response[0];

                        if (isSliced) {
                            missingObj.missing_sliced = response[1];
                        }

                        // Push in routes global array
                        routesJSON.missing.push(missingObj);
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
            }

            feature.properties.connections = json_result;
            parent.places_aoi_street_distance.features.push(feature);

            // All settlements processed
            if (parent.places_aoi_street_distance.features.length === places_aoi.features.length) {

                var features = parent.places_aoi_street_distance.features;

                var mapped = features.map(function(el, i) {
                    return { index: i, value: el };
                });

                // Sort by distance to street, descendent
                mapped.sort(function(a,b) {
                    return b.value.properties.connections.distance_to_street - a.value.properties.connections.distance_to_street;
                });

                // We use the keys of the array to set now the position
                for (var i=0; i<mapped.length; i++) {
                    parent.places_aoi_street_distance.features[mapped[i].index].properties.connections.distance_order = i;
                }

                parent.places_aoi_street_distance.features.sort(function (a, b) {
                    return d3.ascending(a.properties.name, b.properties.name);
                });


                // Village group
                parent.svglayer.selectAll(".village-group").each(function(d) {

                    var current_el = d3.select(this);

                    if (app.config.layoutdebug === true) {
                        current_el.append("rect")
                            .attr("class", "layoutdebug");
                    }

                    var distance_to_street = 0;

                    // Only append line for missing route part and circe for nearest-road-point if missing distance is higher than distance_threshold
                    if (d.properties.connections.distance_to_street > parent.distance_threshold) {

                        current_el.append("line")
                            .attr("class", "missing");

                        current_el.append("circle")
                            .attr({ "r": 3 })
                            .attr("class", "nearest-road");

                        distance_to_street = d.properties.connections.distance_to_street;
                    }

                    /*var current_el_text = current_el.append("text").attr("y", "0");

                    current_el_text.append("tspan")
                        .text(d.properties.name)
                        .attr("class", "title")
                        .attr("x", 0)
                        .attr("dy", "0");

                    current_el_text.append("tspan")
                        .text(Math.round(distance_to_street)+" m to street")
                        .attr("x", 0)
                        .attr("dy", "1em");*/

                });

                parent.update(0);
            }

        }
    }
}
