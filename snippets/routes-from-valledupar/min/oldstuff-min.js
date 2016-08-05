function getOverlappingGeometry(geometry1, geometry2) {
    var overlappingGeometry = [];
    for (var i = 0; i < geometry1.length; i++) {
        for (var j = 0; j < geometry2.length; j++) {
            if (geometry1[i].equals(geometry2[j])) {
                overlappingGeometry.push(geometry1[i]);
            }
        }
    }
    return overlappingGeometry;
}

function compareRouteWithCollection(r, c) {
    if (c.length > 1) {
        for (var i = 0; i < c.length; i++) {
            if (r.id !== c[i].id) {
                var overlapping_route = getOverlappingGeometry(r.geometry, c[i].geometry);
                if (overlapping_route.length > 0) {
                    var test = overlapping_route.length.toString().concat(overlapping_route[0][0].toString()).concat(overlapping_route[0][1].toString());
                    var overlapping_route_exists = false;
                    for (var j = 0; j < overlapping_routes.length; j++) {
                        if (overlapping_routes[j] === test) {
                            overlapping_route_exists = true;
                            break;
                        }
                    }
                    if (!overlapping_route_exists) {
                        overlapping_routes.push(test);
                        pushToKnotpoint(overlapping_route[0]);
                        pushToKnotpoint(overlapping_route[overlapping_route.length - 1]);
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
    for (var i = 0; i < knotpoints.length; i++) {
        var point_equals = true;
        for (var j = 0; j < point.length - 1; j++) {
            if (knotpoints[i][j] !== point[j]) {
                point_equals = false;
            }
        }
        if (point_equals) {
            enable_push = false;
        }
    }
    if (enable_push) {}
}