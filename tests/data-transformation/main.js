var $ = require('jquery');
var turf = require("turf");
var fs = require('fs');

var featuresArray = [];

var parsedJSON = require('../../data/roads_aoi.json');

for (var i=0; i<parsedJSON.features.length; i++) {

    var current_el = parsedJSON.features[i];
    var osm_id = current_el.properties.osm_id;

    for (var j=0; j<current_el.geometry.coordinates.length; j++) {

        var feature = {
          "type": "Feature",
          "properties": {
              "osm_id": osm_id
          },
          "geometry": {
            "type": "Point",
            "coordinates": current_el.geometry.coordinates[j]
          }
        }

        featuresArray.push(feature);

    }

}










var fc = {
  "type": "FeatureCollection",
  "features": featuresArray
};

var fc_s = JSON.stringify(fc);

fs.writeFile("featureCollection.JSON", fc_s, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
