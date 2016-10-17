
    // Returns overlapping geometry of two path arrays of points of a line
    function getOverlappingGeometry(geometry1, geometry2) {

        var overlappingGeometry = [];

        for (var i=0; i<geometry1.length; i++) {
            for (var j=0; j<geometry2.length; j++) {
                if (geometry1[i].equals(geometry2[j])) {
                    overlappingGeometry.push(geometry1[i]);
                }
            }
        }

        return overlappingGeometry;

    }

    // c = collection of existing routes
    // r = new route to add
    function compareRouteWithCollection(r, c) {

        //pushToKnotpoint(r.geometry[0]);
        //pushToKnotpoint(r.geometry[r.geometry.length-1]);

        // there are several routes in the collection
        if (c.length > 1) {

            // there are existing routes
            // for all existing routes
            for (var i=0; i<c.length; i++) {

                // current route is equal to current route in collection
                if (r.id !== c[i].id) {

                    var overlapping_route = getOverlappingGeometry(r.geometry, c[i].geometry);

                    if (overlapping_route.length>0) {

                        var test = overlapping_route.length.toString().concat(overlapping_route[0][0].toString()).concat(overlapping_route[0][1].toString());

                        var overlapping_route_exists = false;
                        for (var j=0; j<overlapping_routes.length; j++) {
                            if (overlapping_routes[j] === test) {
                                overlapping_route_exists = true;
                                break;
                            }
                        }

                        if (!overlapping_route_exists) {

                            overlapping_routes.push(test);

                            pushToKnotpoint(overlapping_route[0]);
                            pushToKnotpoint(overlapping_route[overlapping_route.length-1]);
                            var feature = {};
                            feature.type = "Feature";
                            feature.geometry = {};
                            feature.geometry.type = "LineString";
                            feature.geometry.coordinates = overlapping_route;
                            feature.properties = {};
                            resultingGEOJSON.features.push(feature);

                        }

                    }


                }
            }
        }
    }

    function pushToKnotpoint(point) {

        var enable_push = true;

        for (var i=0; i<knotpoints.length; i++) {

            var point_equals = true;
            for (var j=0; j<point.length-1; j++) {
                if (knotpoints[i][j] !== point[j]) { point_equals = false; }
            }

            if (point_equals) {
                enable_push = false;
            }

        }

        if (enable_push) {

            /*kps.append("circle")
                    .attr({ "r": 8 })
                    .attr("class", "knotpoint")
                    .attr("data-coord-x", point[0])
                    .attr("data-coord-y", point[1])
                    .attr("cx", function() { return project(point).x; } )
                    .attr("cy", function() { return project(point).y; } );

            knotpoints.push(point);*/

        }

    }
