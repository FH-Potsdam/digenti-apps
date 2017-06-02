var config = {};

// Mapbox
config.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// Tabletop
config.tabletop = false;

// DIGENTI API
config.apiBase = "http://localhost:61002/api";

// Datasets
config.data = {};
config.data.places = 'places_aoi_dane.json';

// Map config
config.map = {};
config.map.zoom = 11.2;
config.map.center = [-73.09, 10.422];

// Theme
config.theme = "dark"; // Possible values: 'light', 'dark'. Default: 'light'
config.noUI = false;

// Routes origin
config.coordHomeBase = "10.471667,-73.25";

// Show threat data
config.threat = {};
config.threat.show = false;
config.threat.buffer = 350;
config.threat.intersect = true;

// Settlements mode
config.multipleSettlements = false;

// Vis params
config.circleRadius = 5;
config.transitionTime = 500;

// Debug mode
config.layoutdebug = false;
