////////////////////
// Isolines Layer
////////////////////

function isolinesLayer(svg) {

    ///////////
    // Base
    ///////////

    var parent = this;


    ////////////////////////////
    // Variables of the Layer
    ////////////////////////////

    //this.svglayer = "";
    this.circleRadius = 5;
    this.isolineColor = '#3dc8e7';
    this.isolineOpacity = 0.35;
    this.isolinesQueried = 0;
    this.bcr = [];
    this.active = true;

    this.isolinesGeoJSON = {
        "type":"FeatureCollection",
        "crs":{
            "type":"name",
            "properties":{
                "name":"urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features":[]
    };


    //////////////////////
    // Functions
    //////////////////////

    /**
     * toogle opacity of the layer
     * @param {state} boolean
     */
    this.setActive = function (state) {

        if (state == null) {
            this.active = !this.active;
        } else {
            this.active = state;
        }

        this.svglayer.classed('disabled', !this.active);
        //  this.svglayer
        //      .transition()
        //      .duration(500)
        //          .style("opacity", function() {
        //              if (parent.active) { return 1; }
        //              else { return 0; }
        //          });
    }

    // This callback is called when clicking on a location
    function click(d, objectID) {
        // var coordinates = d.geometry.coordinates;
        getIsoline(d, objectID);

    }

    function getIsoline(d, objectID) {

        var coordinates = d.geometry.coordinates;

        var coordsStr = coordinates[1]+','+coordinates[0];
        //var range = parseInt($("#range__slider").val());
        var range = 30;

        var uri = 'http://localhost:61002/api/isoline/' + coordsStr + '/' + range;

        // Define a callback function to process the isoline response.
        var onIsolineResult = function(result) {

            this.isolinesQueried++;

            var polygon = result;

            // polygon.properties.objectsID = objectID;

            var settlementPoint = {
                "type": "Feature",
                "properties": {
                    "marker-color": "#f00"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": coordinates
                }
            };

            var polygonBuffered = turf.buffer(polygon, 2000, "meters");

            var isInside = turf.inside(settlementPoint, polygonBuffered.features[0]);

            if (isInside) {

                // Add OSM ID to polygon
                polygon.properties.osm_id = d.properties.osm_id;
                polygon.properties.name = d.properties.name;

                // Save polygon in GeoJSON FeaturesCollection
                parent.isolinesGeoJSON.features.push(polygon);

                // Isoline group
                var g = parent.svglayer.select('g[data-id="'+objectID+'"]').select(".isoline-group-vis");

                // d3 isoline
                var isoline = g.append("path")
                        		.data([polygon])
                                .attr("class", "isoline")
                                .attr("data-id", objectID);

            }

            // Update isolines when all loaded
            if (this.isolinesQueried === places_aoi.features.length) {
                this.update(500);
                console.log("FERTIG");
                //activateButtons();
            }
        };

        $.ajax({
            dataType: "json",
            url: uri,
            //   url: 'http://localhost:61002/api/isoline/',
            //   data: {
            //       coords: coords,
            //       range: range
            //   },
            success: onIsolineResult,
            error: function(error) {
                alert(error);
            }
        });
    }



    /**
     * initializes the layer
     * @param {Number} svg
     * @param {geojson} geojson
     */
    this.init = function (svg, geojson) {

        this.svglayer = svg.append("g").attr("id", "isolines");
        this.setActive(false);

        this.svglayer
                .selectAll("circle")
                .data(geojson.features)
                .enter()
                .append("g")
                    .attr("data-id", function(d) { return d.properties.osm_id; })
                    .attr("class", "isoline-group")
                    .each(function(d) {

                        // Only add helper when 'layoutdebug' is set
                        if (layoutdebug === true) {
                            var current_el = d3.select(this);
                            current_el.append("rect")
                                .attr("class", "layoutdebug");
                                // .attr("class", "layoutdebug" + ((layoutdebug === true) ? 'active' : ''));
                        }
                    })
                    .append("g")
                        .attr("class", "isoline-group-vis")
                        .each(function(d) {
                            var current_el = d3.select(this);

                            current_el.append("circle")
                                // .attr({
                                //     "r": config.circleRadius
                                // })
                                .attr("class", "village")
                                .attr("data-id", function(d) { return d.properties.osm_id; })
                                .each(function(d) {
                                    getIsoline(d, d.properties.osm_id);
                                });
                        });



    }



    /**
     * updates the view of the layer
     * @param {Number} transition_time
     */
    this.update = function (transition_time) {

        // Path transform
        var transform = d3.geo.transform({point: projectPoint});
    	var path = d3.geo.path().projection(transform);

        if (isDefined(this.svglayer)) {

            if (config.view === "smallmultiples") {

                // Transform isolines
                var ix = 0;
                var iy = 0;

                var max_path_w = 0;
                var max_path_h = 0;

                this.svglayer.selectAll(".isoline-group-vis").each(function(d, i) {

                    var current_el = d3.select(this);

                    // Check max width / height
                    var current_path_w = current_el.node().getBBox().width;
                    var current_path_h = current_el.node().getBBox().height;

                    if (current_path_h>max_path_h) { max_path_h = current_path_h; }
                    if (current_path_w>max_path_w) { max_path_w = current_path_w; }

                });


                var faktor_height = config.layout.heightperelement/max_path_h;
                var faktor_width = config.layout.widthperelement/max_path_w;

                var scaleFactor = faktor_height;
                if (faktor_width<scaleFactor) { scaleFactor=faktor_width; }

                this.svglayer.selectAll(".isoline-group").each(function(d, index) {

                    var current_el = d3.select(this);

                    if (layoutdebug === true) {
                        current_el.selectAll(".layoutdebug")
                            // .attr("fill", "rgba(255, 0, 255, 0.3)")
                            .attr("width", config.layout.widthperelement)
                            .attr("height", config.layout.heightperelement);
                    } /*else {
                        current_el.selectAll(".layoutdebug")
                            // .attr("fill", "none")
                            .attr("width", config.layout.widthperelement)
                            .attr("height", config.layout.heightperelement);
                    }*/

                    current_el
                        .transition()
                        .duration(transition_time)
                            .style("opacity", 1)
                            .attr("transform", function() {
                                var x = config.layout.offsetLeft + (ix-1)*config.layout.gapX + ix*config.layout.widthperelement;
                                var y = config.layout.offsetTop + (iy-1)*config.layout.gapY + iy*config.layout.heightperelement;
                                ix++;
                                if (ix === config.layout.cols) { ix = 0; }
                                iy++;
                                if (iy === config.layout.rows) { iy = 0; }
                                return "translate("+x+","+y+")";
                            });

                });


                // Update isolines
                this.svglayer.selectAll(".isoline-group-vis").each(function(d, index) {

                    var current_el = d3.select(this);

                    current_el
                        .transition()
                        .duration(transition_time)
                            .style("opacity", 1)
                            .attr("transform", function() {
                                var bbox = d3.select(this).node().getBBox();
                                var x = -bbox.x + ((config.layout.widthperelement/scaleFactor)/2) - (bbox.width/2);
                                var y = -bbox.y + ((config.layout.heightperelement/scaleFactor)/2) - (bbox.height/2);
                                return "scale("+scaleFactor+") translate("+x+","+y+")";
                            });

                    current_el.selectAll("circle")
                        .transition()
                        .delay(transition_time/6)
                        .duration(transition_time)
                        .attr({
                            "r": config.circleRadius/scaleFactor
                        })
                        .each(function() {
                            parent.bcr[d3.select(this).attr("data-id")] = d3.select(this).node().getBoundingClientRect();
                        });
                });

                // Update isolines
                this.svglayer.selectAll(".isoline").each(function(d, index) {
                    var isoline = d3.select(this);
                    isoline.attr("d", path);
                });



            } else {

                this.svglayer.selectAll(".isoline-group").each(function(d, i) {

                    var current_el = d3.select(this);

                    current_el
                        .transition()
                        .duration(transition_time)
                            .style("opacity", 1)
                            // .attr("stroke-width", 2)
                            .attr("transform", function() { return ""; });

                });


                this.svglayer.selectAll(".isoline-group-vis").each(function(d, i) {

                    var current_el = d3.select(this);

                    current_el
                        .transition()
                        .duration(transition_time)
                            .attr("transform", function() { return ""; });
                });

                // Update villages
                this.svglayer.selectAll("circle").each(function() {

                    var current_el = d3.select(this);

                    //console.log(current_el.node().getBoundingClientRect());

                    current_el
                        .transition()
                        .duration(transition_time)
                            .attr({ "r": config.circleRadius })
                            .attr({
                                cx: function(d) { return project(d.geometry.coordinates).x; },
                                cy: function(d) { return project(d.geometry.coordinates).y; },
                            });

                });

                // Update isolines
                this.svglayer.selectAll(".isoline").each(function(d, index) {
                    var isoline = d3.select(this);
                    isoline.attr("d", path);
                });

                // showMap();
            }
        }
    }
}
