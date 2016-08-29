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
    this.bcr = [];
    this.active = true;

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

         this.svglayer
             .transition()
             .duration(500)
                 .style("opacity", function() {
                     if (parent.active) { return 1; }
                     else { return 0; }
                 });
     }

    /**
     * initializes the layer
     * @param {Number} svg
     * @param {geojson} geojson
     */
    this.init = function (svg, geojson) {

        this.svglayer = svg.append("g").attr("class", "routesfromvalledupar");
        this.setActive(false);

        function routingCar(start, end, placeID) {


            // case of error (hopefully not…)
            function onError(e) { console.log(e); }

            function processRoute(route) {


                // Add route path to svg
                parent.svglayer.selectAll("g[data-id='"+route.id+"']").selectAll("g")
                        .append("path")
                        .attr("data-id", route.id)
                        .attr("data-traveltime", route.travelTime)
                        .attr("class", "route")
                        .attr("stroke-width", 3)
                        .attr("d", route.path);

                // push route geometry to routes_geo-Array
                parent.routes_geo[route.id] = route.geometry.coordinates;

            }

            // succeeded!
            function onSuccess(r) {

                // initialize route from response
                var route = {
                        init: function() {
                            this.id = placeID;
                            this.geometry = r.geometry;
                            this.travelTime = r.properties.travelTime;
                            this.path = lineFunction(this.geometry.coordinates);
                            return this;
                        }
                    }.init();

                var routeasjson = {};
                routeasjson.id = placeID;
                routeasjson.route = route;
                routesJSON.routes.push(routeasjson);

                if (routesJSON.routes.length === geojson.features.length) {
                    /*console.log("42");

                    function onSuccess2(r) {
                        console.log(r);
                    }

                    console.log(routesJSON.routes[0]);
                    console.log({ name: "John", time: "2pm" });

                    var test = { "0": routesJSON.routes[0], "1": routesJSON.routes[1] };
                    console.log(test);

                    function toObject(arr) {
                        var rv = {};
                        //for (var i = 0; i < arr.length; ++i) {
                        for (var i = 0; i < arr.length; ++i) {
                            rv[i] = arr[i];
                        }
                        return rv;
                    }

                    var obj = toObject(routesJSON.routes);

                    console.log(obj);

                    $.ajax({
                        method: "POST",
                        url: "http://localhost:61002/api/geoprocessing/routeparts",
                        //data: JSON.stringify({ name: "John", time: "2pm" }),
                        data: JSON.stringify(obj),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: onSuccess2,
                        error: function(error) {
                            alert(error);
                        }
                    });*/



                }

                processRoute(route);

            }

            if (routesJSON.routes.length > 0) {
                // take route from cache
                console.log("ROUTING CACHED");
                processRoute(routesArray[placeID]);
            } else {
                // call API
                console.log("ROUTING VIA API");
                //router.calculateRoute(routeRequestParams, onSuccess, onError);

                $.ajax({
                    dataType: "json",
                    url: "http://localhost:61002/api/route/"+start+"/"+end,
                    success: onSuccess,
                    error: function(error) {
                        alert(error);
                    }
                });

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
                        //.attr("text-anchor", "middle")
                        .attr("class", "title")
                        .attr("y", "30");
                    current_el.append("rect")
                        .attr("class", "layoutdebug");
                })
                .append("g")
                    .attr("class", "sm_vis")
                    .append("circle")
                        .attr("data-id", function(d) { return d.properties.osm_id; })
                        .attr({ "r": config.circleRadius })
                        .attr("class", "village")
                    .each(function(d) {
                        var current_el = d3.select(this);
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

            // Counter for rows and cols
            var ix = 0;
            var iy = 0;

            // Calculate max. width and height of
            var max_path_w = 0;
            var max_path_h = 0;
            this.svglayer.selectAll(".smallmultiple").selectAll("g").each(function() {
                // Calculate Max height and width of all paths
                var bbox = d3.select(this).node().getBBox();
                if (bbox.height > max_path_h) { max_path_h = bbox.height; }
                if (bbox.width > max_path_w) { max_path_w = bbox.width; }
            });

            // Calculate Width for each element
            var widthperelement = (config.layout.w - config.layout.offsetLeft - config.layout.offsetRight - (config.layout.cols-1)*config.layout.gapX) / config.layout.cols;
            var heightperelement = (config.layout.h - config.layout.offsetTop - config.layout.offsetBottom - (config.layout.rows-1)*config.layout.gapY) / config.layout.rows;

            // Calculate scaleFactor
            var faktor_height = (heightperelement-20)/max_path_h;
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
                            var x = config.layout.offsetLeft + (ix-1)*config.layout.gapX + ix*widthperelement;
                            var y = config.layout.offsetTop + (iy-1)*config.layout.gapY + iy*heightperelement;
                            ix++;
                            if (ix === config.layout.cols) { ix = 0; }
                            iy++;
                            if (iy === config.layout.rows) { iy = 0; }
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

                current_el.selectAll("text")
                    .attr("x", 0)
                    .attr("y", heightperelement)
                    .transition().duration(transition_time)
                        .style("opacity", 1);

                current_el.selectAll("g")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            var bbox = d3.select(this).node().getBBox();
                            var x = -bbox.x;
                            var y = -bbox.y-bbox.height+(heightperelement-20)/scaleFactor;
                            return "scale("+scaleFactor+") translate("+x+","+y+")";
                        });

                current_el.selectAll("g").selectAll("path")
                    .transition()
                    .duration(transition_time)
                        .attr("stroke-width", function() { return 2/scaleFactor; });

                current_el.selectAll("g").selectAll("circle")
                    .attr({ "r": config.circleRadius/scaleFactor });

                current_el.selectAll("g").selectAll("circle")
                    .each(function() {
                        parent.bcr[d3.select(this).attr("data-id")] = d3.select(this).node().getBoundingClientRect();
                    });

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
                        .attr("transform", "");

                current_el.selectAll("text")
                    .transition().duration(transition_time)
                        .style("opacity", 0);

                current_el.selectAll("g")
                    .transition()
                    .duration(transition_time)
                        .attr("transform", "");

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
                        .attr({ "r": config.circleRadius });

            });

        }


    }


}
