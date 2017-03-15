/*global d3:true */
/*global console:true */
/*global app:true */
/*global alert:true */
/*global project:true */
/*global updateSettlementPointLayer:true */
/*global routesGeoJSON:true */
/*global routesJSON:true */
/*global lineFunction:true */
/*global repositionLabels:true */
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
    // DEPRECATED this.active = true;
    this.scaleFactor = 0;
    this.lastView = "";

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
        this.svglayer = svg.append("g").attr("id", "routesfromvalledupar");
        // Deactivate this layer by default
        // DEPRECATED this.setActive(true);

        function routing(start, end, placeID) {

            function processRoute(route) {

                // generate a random unique id to identify the path later
                var uid = generateUniqueID();

                // for each village that is supplied by this route part
                for (var i=0; i<route.properties.id.length; i++) {

                    // Add route path to svg
                    parent.svglayer.selectAll("g[data-id='"+route.properties.id[i]+"']")
                            .append("path")
                                .attr("data-id", uid)
                                //.attr("data-traveltime", route.travelTime)
                                .attr("class", "route")
                                .attr("data-stroke-width", route.properties.importancescore*0.4 + 1)
                                .attr("stroke-width", route.properties.importancescore*0.4 + 1)
                                .attr("d", lineFunction(route.geometry.coordinates));

                    // push route geometry to routes_geo-Array
                    parent.routes_geo[uid] = route.geometry.coordinates;
                }
            }

            // succeeded!
            function onRouteLoadSuccess(response) {

                var isSliced = (response instanceof Array);

                // If the response is an array, in the first position you find the route and in the second a featured collection with the sliced route with elevation.
                var r = isSliced ? response[0] : response;

                // Set place ID as route ID and save it into the feature collection
                r.properties.id = placeID;
                routesGeoJSON.features.push(r);

                // initialize route from response
                var route = {
                        init: function() {
                            this.id = placeID;
                            this.geometry = r.geometry;
                            this.travelTime = r.properties.travelTime;
                            this.distance = r.properties.distance;
                            this.path = lineFunction(this.geometry.coordinates);
                            return this;
                        }
                    }.init();

                var routeObj = {};
                routeObj.id = placeID;
                routeObj.route = route;

                if (isSliced) {
                    routeObj.route_sliced = response[1];
                }

                // Push in routes global array
                routesJSON.routes.push(routeObj);

                // All routes retrieved
                if (routesJSON.routes.length === geojson.features.length) {

                    // console.log(routesJSON);

                    // Make ajax Call to API to get route parts
                    $.ajax({
                        method: "POST",
                        url: app.config.apiBase + "/geoprocessing/routeparts",
                        data: JSON.stringify(jsonToObjectRouteOnly(routesJSON.routes)),
                        // data: JSON.stringify(jsonToObject(routesJSON.routes)),
                        // data: JSON.stringify(jsonToObject(routesJSONSimplify(routesJSON.routes))),
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

                // console.log("settlement: " +  placeID + ", route: " + app.config.apiBase + "/route/"+start+"/"+end+"/?profile=true");

                // call API
                $.ajax({
                    dataType: "json",
                    // url: app.config.apiBase + "/route/"+start+"/"+end,
                    url: app.config.apiBase + "/route/"+start+"/"+end+"/?profile=true",
                    success: onRouteLoadSuccess,
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
                .attr("class", "smallmultiple sm_vis")
                .attr("data-id", function(d) { return d.properties.osm_id; })
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
            this.svglayer.selectAll(".smallmultiple").each(function() {
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

                smpos[smallmultiple.attr("data-id")] = {};
                smpos[smallmultiple.attr("data-id")].x = smallmultiple_x;
                smpos[smallmultiple.attr("data-id")].y = smallmultiple_y;

                console.log(smpos[smallmultiple.attr("data-id")]);

                var bbox = smallmultiple.node().getBBox();

                var smallmultiple_group_x = -bbox.x * parent.scaleFactor;
                var smallmultiple_group_y = (-bbox.y-bbox.height + (app.layout.heightperelement-20)/parent.scaleFactor) * parent.scaleFactor;

                smallmultiple
                    .attr("data-transformX", smallmultiple_group_x)
                    .attr("data-transformY", smallmultiple_group_y);

                var realX = parseFloat(project(thedata).x * parent.scaleFactor) + smallmultiple_group_x + smallmultiple_x;
                var realY = parseFloat(project(thedata).y * parent.scaleFactor) + smallmultiple_group_y + smallmultiple_y;

                // DEPRECATED if (parent.active) {
                /*
                    app.villagePositions[smallmultiple.attr("data-id")] = {};
                    app.villagePositions[smallmultiple.attr("data-id")].x = realX;
                    app.villagePositions[smallmultiple.attr("data-id")].y = realY;
                    */
                // DEPRECATED }
            });
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
                var current_id = current_el.attr("data-id");

                if (app.config.layoutdebug === true) {
                    current_el.selectAll(".layoutdebug")
                        .attr("width", app.layout.widthperelement)
                        .attr("height", app.layout.heightperelement);
                }

                current_el
                    .transition()
                    .duration(transition_time)
                        //.style("opacity", 1)
                        .attr("transform", function() {
                            return "translate("+ smpos[current_id].x +","+ smpos[current_id].y +") scale("+parent.scaleFactor+")";
                        });

            });


        } else {

            this.svglayer.selectAll(".smallmultiple").each(function() {

                var current_el = d3.select(this);

                if (parent.lastView !== app.view || parent.lastView === "") {
                    current_el
                        .transition()
                        .duration(transition_time)
                            //.style("opacity", 1)
                            .attr("transform", "");
                }

                current_el.selectAll("path")
                    .each(function() {
                        var current_path = d3.select(this);
                        current_path.attr("d", lineFunction(parent.routes_geo[current_path.attr("data-id")]));
                    });
            });

        }

        parent.lastView = app.view;

    };


}
