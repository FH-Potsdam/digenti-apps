/*global d3:true */
/*global turf:true */
/*global console:true */
/*global app:true */
/*global isDefined:true */
/*global alert:true */
/*global project:true */
/*global projectPoint:true */
/*global places_aoi:true */
/*global updateSettlementPointLayer:true */
/* exported isolinesLayer */



////////////////////
// Isolines Layer
////////////////////

function isolinesLayer() {

    ///////////
    // Base
    ///////////

    var parent = this;


    ////////////////////////////
    // Variables of the Layer
    ////////////////////////////

    //this.svglayer = "";
    this.isolineColor = '#3dc8e7';
    this.isolineOpacity = 0.35;
    this.isolinesQueried = 0;
    this.active = true;
    this.scaleFactor = 0;

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

    this.range = 0;
    this.isolinesQueried = 0;

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

    this.setRange = function(range) {

        this.range = range;
        // console.log("Set isoline range: " + this.range);
    };

    this.toggleIsolines = function() {

        console.log("toggle isolines - range: " + this.range);

        // this.svglayer.selectAll('.isoline-group-vis path.isoline').classed("disabled", true);

        // this.svglayer.selectAll('.isoline-group-vis path.isoline[data-range="'+this.range+'"]').classed("disabled", function() {

        this.svglayer.selectAll('.isoline-group-vis path.isoline').classed("disabled", function() {
            var isoline = d3.select(this);
            return isoline.attr("data-range") != parent.range;
        });

        // // Isoline group
        // this.svglayer.selectAll(".isoline-group-vis path.isoline").each(function() {
        //
        //     var isoline = d3.select(this);
        //     console.log("isoline range: " + isoline.attr("data-range"));
        //
        //     // isoline.classed("disabled", true)
        //     isoline.classed("disabled", function() { return isoline.attr("data-range") != parent.range; })
        // });
    }


    function getIsoline(d, objectID) {

        var coordinates = d.geometry.coordinates;

        var coordsStr = coordinates[1]+','+coordinates[0];
        // var currentRange = parseInt($("#range__slider").val());
        var range = '15,30,45';

        var uri = app.config.apiBase + '/isoline/' + coordsStr + '/' + range;

        // Define a callback function to process the isoline response.
        var onIsolineResult = function(featuredCollection) {

            parent.isolinesQueried++;

            for (var i=0; i<featuredCollection.features.length; i++) {

                var polygon = featuredCollection.features[i],
                    isolineRange = polygon.properties.range;

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

                if (turf.inside(settlementPoint, polygonBuffered.features[0])) {

                    // Add OSM ID to polygon
                    polygon.properties.osm_id = d.properties.osm_id;
                    polygon.properties.name = d.properties.name;

                    // Save polygon in GeoJSON FeaturesCollection
                    parent.isolinesGeoJSON.features.push(polygon);

                    // Isoline group
                    var g = parent.svglayer.select('g[data-id="'+objectID+'"]').select(".isoline-group-vis");

                    // d3 isoline
                    g.append("path")
                        .data([polygon])
                        .classed("isoline", true)
                        .classed("disabled", function() { return isolineRange != parent.range; })
                        .attr("data-range", isolineRange)
                        .attr("data-id", objectID);

                }
            }

            // // Update isolines when all loaded
            // if (parent.isolinesQueried === places_aoi.features.length) {
            //     parent.update(app.config.transitionTime);
            //     console.log("FERTIG");
            // }
        };

        $.ajax({
            dataType: "json",
            url: uri,
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

        // add new group for this layer to svg
        this.svglayer = svg.append("g").attr("id", "isolines");
        // Deactivate this layer by default
        this.setActive(false);

        // append groups and bind data
        this.svglayer
                .selectAll("g")
                .data(geojson.features)
                .enter()
                .append("g")
                    .attr("data-id", function(d) { return d.properties.osm_id; })
                    .attr("class", "isoline-group")
                    .each(function() {
                        // Only add helper when 'layoutdebug' is set
                        if (app.config.layoutdebug === true) {
                            d3.select(this).append("rect")
                                .attr("class", "layoutdebug");
                        }
                    })
                    .append("g")
                        .attr("class", "isoline-group-vis")
                        .each(function(d) {
                            getIsoline(d, d.properties.osm_id);
                        });



    };

    /**
     * calculates the view of the layer
     */
    this.calc = function() {

        if (isDefined(this.svglayer)) {

            if (app.view === "smallmultiples") {

                // Transform isolines
                var ix = 0;
                var iy = 0;

                var max_path_w = 0;
                var max_path_h = 0;

                this.svglayer.selectAll(".isoline-group-vis").each(function() {

                    var current_el = d3.select(this);

                    // Check max width / height
                    var current_path_w = current_el.node().getBBox().width;
                    var current_path_h = current_el.node().getBBox().height;

                    if (current_path_h>max_path_h) { max_path_h = current_path_h; }
                    if (current_path_w>max_path_w) { max_path_w = current_path_w; }

                });


                var faktor_height = app.layout.heightperelement/max_path_h;
                var faktor_width = app.layout.widthperelement/max_path_w;

                parent.scaleFactor = faktor_height;
                if (faktor_width<parent.scaleFactor) { parent.scaleFactor=faktor_width; }


                // CALC

                this.svglayer.selectAll(".isoline-group").each(function(d) {

                    var isoline_group = d3.select(this);
                    var thedata = d.geometry.coordinates;

                    if (app.config.layoutdebug === true) {
                        isoline_group.selectAll(".layoutdebug")
                            .attr("width", app.layout.widthperelement)
                            .attr("height", app.layout.heightperelement);
                    }

                    var isoline_group_x = app.layout.offsetLeft + ix*(app.layout.gapX+app.layout.widthperelement);
                    ix++;
                    if (ix === app.layout.cols) { ix = 0; }

                    var isoline_group_y = app.layout.offsetTop + iy*(app.layout.gapY+app.layout.heightperelement);
                    iy++;
                    if (iy === app.layout.rows) { iy = 0; }

                    isoline_group
                        .attr("data-transformX", isoline_group_x)
                        .attr("data-transformY", isoline_group_y);

                    isoline_group.selectAll(".isoline-group-vis").each(function() {

                        var isoline_group_vis = d3.select(this);
                        var bbox = d3.select(this).node().getBBox();

                        var isoline_group_vis_x = (-bbox.x + ((app.layout.widthperelement/parent.scaleFactor)/2) - (bbox.width/2)) * parent.scaleFactor;
                        var isoline_group_vis_y = (-bbox.y + ((app.layout.heightperelement/parent.scaleFactor)/2) - (bbox.height/2))*parent.scaleFactor;

                        isoline_group_vis
                            .attr("data-transformX", isoline_group_vis_x)
                            .attr("data-transformY", isoline_group_vis_y);

                        var realX, realY;

                        if (bbox.width === 0 && bbox.height === 0) {
                            realX = isoline_group_vis_x + isoline_group_x;
                            realY = isoline_group_vis_y + isoline_group_y;
                        } else {
                            realX = parseFloat(project(thedata).x * parent.scaleFactor) + isoline_group_vis_x + isoline_group_x;
                            realY = parseFloat(project(thedata).y * parent.scaleFactor) + isoline_group_vis_y + isoline_group_y;
                        }

                        if (parent.active) {
                            app.villagePositions[isoline_group.attr("data-id")] = {};
                            app.villagePositions[isoline_group.attr("data-id")].x = realX;
                            app.villagePositions[isoline_group.attr("data-id")].y = realY;
                        }


                    });


                });



            } else {
                if (parent.active) {
                    app.villagePositions = app.villagePositionsMap.slice();
                }
            }

        }

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
     * renders the view of the layer
     * @param {Number} transition_time
     */
    this.render = function (transition_time) {

        // Path transform
        var transform = d3.geo.transform({point: projectPoint});
    	var path = d3.geo.path().projection(transform);

        if (isDefined(this.svglayer)) {

            if (app.view === "smallmultiples") {

                // RENDER

                this.svglayer.selectAll(".isoline-group")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            return "translate("+ d3.select(this).attr("data-transformX") +","+ d3.select(this).attr("data-transformY") +")";
                        });

                // Update isolines
                this.svglayer.selectAll(".isoline-group-vis")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() {
                            return "translate("+d3.select(this).attr("data-transformX")+","+d3.select(this).attr("data-transformY")+") scale("+parent.scaleFactor+")";
                        });


                // Update isolines
                this.svglayer.selectAll(".isoline")
                    .attr("d", path);


            } else {

                this.svglayer.selectAll(".isoline-group")
                    .transition()
                    .duration(transition_time)
                        .style("opacity", 1)
                        .attr("transform", function() { return ""; });

                this.svglayer.selectAll(".isoline-group-vis")
                    .transition()
                    .duration(transition_time)
                        .attr("transform", function() { return ""; });



                // Update isolines
                this.svglayer.selectAll(".isoline")
                    .attr("d", path);

            }
        }
    };
}
