function missingInfrastructureLayer(svg) {


    //////////////////////
    // Base
    //////////////////////
    var parent = this;


    //////////////////////
    // Variables of the Layer
    //////////////////////
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

    this.bcr = [];

    //////////////////////
    // Functions
    //////////////////////

    this.setActive = function (state) {
        this.active = state;
        this.svglayer
            .transition()
            .duration(500)
                .style("opacity", function() {
                    if (state) { return 1; }
                    else { return 0; }
                });
    }

    /**
     * initializes the layer
     * @param {Number} svg
     * @param {geojson} geojson
     */
    this.init = function (svg, geojson) {

        this.svglayer = svg.append("g")
                .attr("class", "villages");

        this.villages = this.svglayer.selectAll("g")
                            .data(geojson.features)
                            .enter()
                            .append("g")
                                .attr("class", "village-group")
                                .append("circle")
                                    .attr({ "r": config.circleRadius })
                                    .attr("class", "village")
                                    .attr("data-id", function(d) { return d.properties.osm_id; })
                                    .on("click", function(d) {
                                        d3.select(this).classed("selected", true);
                                        var objectID = d3.select(this).attr("data-id");
                                        selectSettlement(d.properties.osm_id);
                                    });

        this.setActive(false);

        distanceAll();

    }



    /**
     * updates the view of the layer
     * @param {Number} transition_time
     */
    this.update = function (transition_time) {

        // Small multiples
        if (config.view === "smallmultiples") {

            var ix = 0;
            var iy = 0;

            var widthperelement = (config.layout.w - config.layout.offsetLeft - config.layout.offsetRight - (config.layout.cols-1)*config.layout.gapX) / config.layout.cols;
            var heightperelement = (config.layout.h - config.layout.offsetTop - config.layout.offsetBottom - (config.layout.rows-1)*config.layout.gapY) / config.layout.rows;

            var positionSmallVisY = (heightperelement-20)/2;

            var arr = [],
                orderedArray = [];

            for (var i=0; i<parent.places_aoi_street_distance.features.length; i++) {
                arr.push(parent.places_aoi_street_distance.features[i].properties.connections.distance_to_street);
            }

            // console.log(arr);
            var max = Math.max.apply(null, arr);

            var faktor = (config.layout.gap_hor*0.8)/(max*2);

            parent.svglayer.selectAll(".village-group").each(function(d) {

                var current_el = d3.select(this);

                current_el
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {

                            if (config.orderby == "distance") {
                                var pos = d.properties.connections.distance_order;
                                iy = Math.floor(pos/config.layout.cols);
                                ix = Math.round(config.layout.cols*((pos/config.layout.cols)-iy));
                            }

                            var x = config.layout.offsetLeft + (ix-1)*config.layout.gapX + ix*widthperelement;
                            var y = config.layout.offsetTop + (iy-1)*config.layout.gapY + iy*heightperelement;
                            return "translate("+x+","+y+")";
                        });

                if (layoutdebug === true) {
                    current_el.selectAll(".layoutdebug")
                        .attr("fill", "rgba(255, 0, 255, 0.3)")
                        .attr("width", widthperelement)
                        .attr("height", heightperelement);
                } else {
                    current_el.selectAll(".layoutdebug")
                        .attr("fill", "none")
                        .attr("width", widthperelement)
                        .attr("height", heightperelement);
                }


                current_el.select(".village")
                    .attr("cy", positionSmallVisY)
                    .attr("cx", function() {
                        var gap = 8;
                        if (d.properties.connections.distance_to_street > 0) { gap = 2*faktor*d.properties.connections.distance_to_street; }
                        return gap;
                    })
                    .each(function() {
                        parent.bcr[d3.select(this).attr("data-id")] = d3.select(this).node().getBoundingClientRect();
                    });


                current_el.select(".nearest-road")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("cy", positionSmallVisY)
                        .attr("cx", function() {
                            var gap = 8;
                            if (d.properties.connections.distance_to_street > 0) { gap = 0; }
                            return gap;
                        });

                current_el.select("line")
                    .transition()
                    .duration(transition_time)
                        .attr("x1", 0)
                        .attr("y1", positionSmallVisY)
                        .attr("x2", 2*faktor*d.properties.connections.distance_to_street)
                        .attr("y2", positionSmallVisY);

                current_el.selectAll("text")
                    .attr("x", 0)
                    .attr("y", heightperelement)
                    .transition()
                    .duration(500)
                        .style("opacity", 1);

                setMapOpacity(0.08);

                if (config.orderby == "size") {
                    ix++;
                    if (ix === config.layout.cols) { ix = 0; }
                    iy++;
                    if (iy === config.layout.rows) { iy = 0; }
                }
            });

        // Map with missing infrastructure
    } else if (config.view === "map-distances") {

            parent.svglayer.selectAll(".village-group").each(function(d) {

                var current_el = d3.select(this);

                var x1 = project(d.geometry.coordinates).x;
                var y1 = project(d.geometry.coordinates).y;
                var x2 = project(d.properties.connections.nearest_point).x - x1;
                var y2 = project(d.properties.connections.nearest_point).y - y1;

                current_el
                    //.transition()
                    //.duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            return "translate("+x1+","+y1+")";
                        });

                current_el.select(".village")
                    .attr("cy", 0)
                    .attr("cx", function() {
                        return 0;
                    })
                    .each(function() {
                        parent.bcr[d3.select(this).attr("data-id")] = d3.select(this).node().getBoundingClientRect();
                    });

                current_el.select(".nearest-road")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("cx", x2)
                        .attr("cy", y2);

                current_el.select("line")
                    .style("opacity", 0.5)
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

        // Map view
        } else {

            parent.svglayer.selectAll(".village-group").each(function(d) {

                var current_el = d3.select(this);

                var x1 = project(d.geometry.coordinates).x;
                var y1 = project(d.geometry.coordinates).y;

                current_el
                    //.transition()
                    //.duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            return "translate("+x1+","+y1+")";
                        });

                current_el.select(".village")
                    .attr("cy", 0)
                    .attr("cx", 0)
                    .each(function() {
                        parent.bcr[d3.select(this).attr("data-id")] = d3.select(this).node().getBoundingClientRect();
                    });

                current_el.select(".nearest-road")
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


    }


    /////////////////////////
    // Calculate Distances
    /////////////////////////

    function distanceAll() {

        for (var i=0; i<places_aoi.features.length; i++) {
            var current_feature = places_aoi.features[i];
            calculateDistance(current_feature.geometry.coordinates, current_feature.properties.osm_id, current_feature);
        }

        var features = parent.places_aoi_street_distance.features;

        var mapped = features.map(function(el, i) {
            return { index: i, value: el };
        });

        // Sort by distance to street, descendent
        mapped.sort(function(a,b) {
            return b.value.properties.connections.distance_to_street - a.value.properties.connections.distance_to_street;
        })

        // We use the keys of the array to set now the position
        for (var i=0; i<mapped.length; i++) {
            parent.places_aoi_street_distance.features[mapped[i].index].properties.connections.distance_order = i;
        }

    }


    function calculateDistance(coordinates, objectID, feature) {

        var json_result;

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
        parent.places_aoi_street_distance.features.push(feature);

        if (parent.places_aoi_street_distance.features.length === places_aoi.features.length) {

            activateButtons();

            parent.places_aoi_street_distance.features.sort(function (a, b) {
                return d3.ascending(a.properties.name, b.properties.name);
            });

            // Village dots
            parent.villages.selectAll(".village")
                    .data(parent.places_aoi_street_distance.features)
                    .attr("data-distance", function(d) { return d.properties.connections.distance_to_street; })
                    .attr("data-touches", function(d) { return d.properties.connections.touches_street; })
                    .enter();

            // Village group
            parent.svglayer.selectAll(".village-group").each(function(d) {

                var current_el = d3.select(this);

                current_el.append("rect")
                    .attr("class", "layoutdebug");

                current_el.append("line")
                    .attr("class", "missing");

                current_el.append("circle")
                    .attr({ "r": 3 })
                    .attr("class", "nearest-road");

                var current_el_text = current_el.append("text").attr("y", "0");

                current_el_text.append("tspan")
                    .text(d.properties.name)
                    .attr("class", "title")
                    .attr("x", 0)
                    .attr("dy", "0");

                current_el_text.append("tspan")
                    .text(Math.round(d.properties.connections.distance_to_street)+" m to street")
                    .attr("x", 0)
                    .attr("dy", "-1em");

            });

            update(0);
        }
    }

}
