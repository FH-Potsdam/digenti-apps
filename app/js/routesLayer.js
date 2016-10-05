/*global d3:true */
/*global console:true */
/*global app:true */
/*global alert:true */
/*global project:true */
/*global updateSettlementPointLayer:true */
/*global routesArray:true */
/*global routesJSON:true */
/*global lineFunction:true */
/* exported routesLayer */










//////////////////
// Routes Layer
//////////////////

function routesLayer() {

    ///////////
    // Base
    ///////////

    var parent = this;


    ////////////////////////////
    // Variables of the Layer
    ////////////////////////////

    this.svglayer = "";
    this.routes_geo = [];
    this.active = true;
    this.scaleFactor = 0;

    //////////////////////
    // Functions
    //////////////////////

    /**
     * toogle opacity of the layer
     * @param {state} boolean
     */
    this.setActive = function (state) {

        if (state === null) { this.active = !this.active; }
        else                { this.active = state; }

        this.svglayer.classed('disabled', !this.active);

    };






    /**
     * initializes the layer
     * @param {Number} svg
     * @param {geojson} geojson
     */
    this.init = function (svg, geojson) {

        // add new group for this layer to svg
        this.svglayer = svg.append("g").attr("id", "routesfromvalledupar");
        // Deactivate this layer by default
        this.setActive(false);




        /*$.ajax({
            dataType: "json",
            url: app.config.apiBase + "/routes/onetomany/" + app.config.coordHomeBase + "/" + coord_settlement,
            success: onSuccess,
            error: function(error) {
                console.log(error);
            }
        });



        $.ajax({
            method: "POST",
            url: app.config.apiBase + "/routes/onetomany/" + app.config.coordHomeBase,
            data: JSON.stringify(jsonToObject(routesJSON.routes)),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                for (var i=0; i<r.data.features.length; i++) {
                    // process route parts
                    processRoute(r.data.features[i]);
                }
            },
            error: function(error) {
                alert(error);
            }
        });
*/


        function routing(start, end, placeID) {


            function processRoute(route) {

                // generate a random unique id to identify the path later
                var uid = generateUniqueID();

                // for each village that is supplied by this route part
                for (var i=0; i<route.properties.id.length; i++) {

                    // Add route path to svg
                    parent.svglayer.selectAll("g[data-id='"+route.properties.id[i]+"']").selectAll("g")
                            .append("path")
                                .attr("data-id", uid)
                                //.attr("data-traveltime", route.travelTime)
                                .attr("class", "route")
                                //.attr("opacity", route.properties.importancescore*0.0238)
                                //.attr("stroke-width", route.properties.importancescore*0.13 + 2)
                                //.attr("stroke-width", 3)
                                .attr("stroke-width", route.properties.importancescore*0.15 + 1)
                                .attr("d", lineFunction(route.geometry.coordinates));

                    // push route geometry to routes_geo-Array
                    parent.routes_geo[uid] = route.geometry.coordinates;
                }
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

                // All routes retrieved
                if (routesJSON.routes.length === geojson.features.length) {

                    // Make ajax Call to API to get route parts
                    $.ajax({
                        method: "POST",
                        url: app.config.apiBase + "/geoprocessing/routeparts",
                        data: JSON.stringify(jsonToObject(routesJSON.routes)),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (r) {
                            for (var i=0; i<r.data.features.length; i++) {
                                // process route parts
                                processRoute(r.data.features[i]);
                            }
                        },
                        error: function(error) {
                            alert(error);
                        }
                    });

                }

                //processRoute(route);

            }

            if (routesJSON.routes.length > 0) {
                // take route from cache
                console.log("ROUTING CACHED");
                //processRoute(routesArray[placeID]);
            } else {
                // call API
                //console.log("ROUTING VIA API");
                //router.calculateRoute(routeRequestParams, onSuccess, onError);

                $.ajax({
                    dataType: "json",
                    url: app.config.apiBase + "/route/"+start+"/"+end,
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
                .each(function() {
                    var current_el = d3.select(this);
                    current_el.append("text")
                        .text(function(d) { return d.properties.name; })
                        .attr("class", "title")
                        .attr("y", "30");

                    if (app.config.layoutdebug === true) {
                        current_el.append("rect")
                            .attr("class", "layoutdebug");
                    }
                })
                .append("g")
                    .attr("class", "sm_vis")
                    .each(function(d) {
                        var coord_end = (d.geometry.coordinates[1]+","+d.geometry.coordinates[0]);
                        routing(app.config.coordHomeBase, coord_end, d.properties.osm_id);
                    });

    };





    /**
     * updates the view of the layer
     * @param {Number} transition_time
     */
    this.update = function (transition_time) {
        this.calc();
        updateSettlementPointLayer(transition_time);
        this.render(transition_time);
    };








    /**
     * calculates the view of the layer
     */
    this.calc = function () {

        if (app.view === "smallmultiples") {

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

            // Calculate parent.scaleFactor
            var faktor_height = (app.layout.heightperelement-20)/max_path_h;
            var faktor_width = app.layout.widthperelement/max_path_w;
            parent.scaleFactor = faktor_height;
            if (faktor_width < parent.scaleFactor) { parent.scaleFactor = faktor_width; }

            this.svglayer.selectAll(".smallmultiple").each(function(d) {

                var smallmultiple = d3.select(this);
                var thedata = d.geometry.coordinates;

                var smallmultiple_x = app.layout.offsetLeft + ix*(app.layout.gapX+app.layout.widthperelement);
                var smallmultiple_y = app.layout.offsetTop + iy*(app.layout.gapY+app.layout.heightperelement);
                ix++;
                if (ix === app.layout.cols) { ix = 0; }
                iy++;
                if (iy === app.layout.rows) { iy = 0; }

                smallmultiple
                    .attr("data-transformX", smallmultiple_x)
                    .attr("data-transformY", smallmultiple_y);

                smallmultiple.selectAll("g").each(function() {

                    var smallmultiple_group = d3.select(this);
                    var bbox = smallmultiple_group.node().getBBox();

                    var smallmultiple_group_x = -bbox.x * parent.scaleFactor;
                    var smallmultiple_group_y = (-bbox.y-bbox.height + (app.layout.heightperelement-20)/parent.scaleFactor) * parent.scaleFactor;

                    smallmultiple_group
                        .attr("data-transformX", smallmultiple_group_x)
                        .attr("data-transformY", smallmultiple_group_y);


                    var realX = parseFloat(project(thedata).x * parent.scaleFactor) + smallmultiple_group_x + smallmultiple_x;
                    var realY = parseFloat(project(thedata).y * parent.scaleFactor) + smallmultiple_group_y + smallmultiple_y;

                    if (parent.active) {
                        app.villagePositions[smallmultiple.attr("data-id")] = {};
                        app.villagePositions[smallmultiple.attr("data-id")].x = realX;
                        app.villagePositions[smallmultiple.attr("data-id")].y = realY;
                    }

                });

            });


        } else {
            if (parent.active) {
                app.villagePositions = app.villagePositionsMap.slice();
            }
        }


    };















    /**
     * updates the view of the layer
     * @param {Number} transition_time
     */
    this.render = function (transition_time) {

        if (app.view === "smallmultiples") {

            // RENDERING OF SMALL MULTIPLES VIEW

            this.svglayer.selectAll(".smallmultiple").each(function() {

                var current_el = d3.select(this);

                current_el
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            return "translate("+ d3.select(this).attr("data-transformX") +","+ d3.select(this).attr("data-transformY") +")";
                        });

                if (app.config.layoutdebug === true) {
                    current_el.selectAll(".layoutdebug")
                        .attr("width", app.layout.widthperelement)
                        .attr("height", app.layout.heightperelement);
                }

                current_el.selectAll("text")
                    .attr("x", 0)
                    .attr("y", app.layout.heightperelement)
                    .transition().duration(transition_time)
                        .style("opacity", 1);

                current_el.selectAll("g")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            return "translate("+ d3.select(this).attr("data-transformX") +","+ d3.select(this).attr("data-transformY") +") scale("+parent.scaleFactor+")";
                        });


            });


        } else {


            this.svglayer.selectAll(".smallmultiple").each(function() {

                var current_el = d3.select(this);

                current_el
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
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
                    });

            });

        }


    };


}
