function routesLayer(svg) {

    //////////////////////
    // Base
    //////////////////////

    var parent = this;

    //////////////////////
    // Variables of the Layer
    //////////////////////
    this.svglayer = "";
    this.routes_geo = [];


    //////////////////////
    // Functions
    //////////////////////

    /**
     * initializes the layer
     * @param {Number} svg
     * @param {geojson} geojson
     */
    this.init = function (svg, geojson) {

        this.svglayer = svg.append("g").attr("class", "smallmultiples");

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
                parent.svglayer.selectAll("g[data-id='"+route.id+"']").selectAll("g")
                        .append("path")
                        .attr("data-id", route.id)
                        .attr("data-traveltime", route.travelTime)
                        .attr("class", "route")
                        .attr("d", route.path)
                        .attr("stroke-width", 2);


                // push route geometry to routes_geo-Array
                parent.routes_geo[route.id] = route.geometry;

                // push route to collection-array and compare it with existing routes
                //routes_collection.push(route);
                //compareRouteWithCollection(route, routes_collection);

                //update(500);

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
                // take route from cache
                console.log("ROUTING CACHED");
                processRoute(routesArray[placeID]);
            } else {
                // call API
                console.log("ROUTING VIA API");
                router.calculateRoute(routeRequestParams, onSuccess, onError);
            }

        }


        parent.svglayer.selectAll("g")
            .data(geojson.features)
            .enter()
            .append("g")
                .attr("class", "smallmultiple")
                .attr("data-id", function(d) { return d.properties.osm_id; })
                .each(function(d) {
                    var current_el = d3.select(this);
                    current_el.append("text")
                        .text(function(d) { return d.properties.name; })
                        .attr("text-anchor", "middle")
                        .attr("class", "title")
                        .attr("y", "30");
                })
                .append("g")
                    .attr("class", "sm_vis")
                    .append("circle")
                        .attr({ "r": 8 })
                        .attr("class", "village")
                    .each(function(d) {
                        var current_el = d3.select(this);
                        var coord_valledupar = "10.471667,-73.25";
                        var coord_end = (d.geometry.coordinates[1]+","+d.geometry.coordinates[0]);
                        routingCar(coord_valledupar, coord_end, d.properties.osm_id);
                    });

    }



    /**
     * updates the view of the layer
     * @param {Number} transition_time
     */
    this.update = function (transition_time) {

        if (config.view === "smallmultiples") {

            // RENDERING OF SMALL MULTIPLES VIEW

            var ix = 0;
            var iy = 0;
            var rows = 7;
            var cols = 6;

            //var gap_hor = (w*0.8)/(cols+1);
            var gap_ver = 20;

            // Calculate max. width and height of
            var max_path_w = 0;
            var max_path_h = 0;

            this.svglayer.selectAll(".smallmultiple").selectAll("g").each(function() {
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

            this.svglayer.selectAll(".smallmultiple").each(function() {

                var current_el = d3.select(this);

                current_el
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            var x = (gap_left)+(ix)*(widthperelement);
                            var y = (iy)*((heightperelement+gap_ver));
                            //var x = (gap_left)+(ix+0.5)*(widthperelement)-current_el.node().getBBox().x-((current_el.node().getBBox().width)/2);
                            //var y = (iy+0.5)*((heightperelement+gap_ver))-current_el.node().getBBox().y-((current_el.node().getBBox().height)/2);
                            ix++;
                            if (ix === cols) { ix = 0; }
                            iy++;
                            if (iy === rows) { iy = 0; }
                            return "translate("+x+","+y+")";
                        });

                current_el
                    .append("rect")
                        .attr("fill", "none")
                        .attr("width", widthperelement)
                        .attr("height", heightperelement);

                current_el.selectAll("text")
                    .attr("x", widthperelement/2)
                    .attr("y", heightperelement)
                    .transition().duration(transition_time)
                        .style("opacity", 1);

                current_el.selectAll("g")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            var bbox = d3.select(this).node().getBBox();
                            var x = ((widthperelement/scaleFactor)-(bbox.width+bbox.x))/2;
                            //var y = -bbox.y;
                            var y = ((heightperelement/scaleFactor)-(bbox.width+bbox.y))/2;
                            return "scale("+scaleFactor+") translate("+x+","+y+")";
                        });

                current_el.selectAll("g").selectAll("path")
                    .transition()
                    .duration(transition_time)
                        .attr("stroke-width", function() { return 2/scaleFactor; });

                current_el.selectAll("g").selectAll("circle")
                    .transition()
                    .duration(transition_time)
                        .attr({ "r": 4/scaleFactor });

            });

            setMapOpacity(0.08);
            disableMapInteraction();


        } else {

            setMapOpacity(1);
            enableMapInteraction();

            this.svglayer.selectAll(".smallmultiple").each(function() {

                var current_el = d3.select(this);

                current_el
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("stroke-width", 2)
                        .attr("transform", function() {
                            return "";
                        });

                current_el.selectAll("text")
                    .transition().duration(transition_time)
                        .style("opacity", 0);

                current_el.selectAll("g")
                    .transition()
                    .duration(transition_time)
                        .attr("transform", function() {
                            return "";
                        });

                current_el.selectAll("g").selectAll("path")
                    .each(function() {
                        var current_path = d3.select(this);
                        current_path.attr("d", lineFunction(parent.routes_geo[current_path.attr("data-id")]));
                    })
                    .transition()
                    .duration(transition_time)
                        .attr("stroke-width", function() { return 2; });

                current_el.selectAll("g").selectAll("circle")
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




}
