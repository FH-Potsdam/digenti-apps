var config = {};

// Tabletop
config.tabletop = false;

// Theme
config.theme = "dark"; // Possible values: 'light', 'dark'. Default: 'light'

// Dev
config.noUI = false;

// Mapbox
config.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// DIGENTI API
config.apiBase = "http://localhost:61002/api";

// Datasets
config.data = {};
config.data.places = 'places_aoi_dane.json';

// Map config
config.map = {};
config.map.zoom = 11.2;
config.map.center = [-73.09, 10.422];

// Routes origin
config.coordHomeBase = "10.471667,-73.25";

// Show threat data
config.threat = {};
config.threat.show = false;
config.threat.showMissing = false;
config.threat.buffer = 350;
config.threat.intersect = true;
config.threat.opacity = 0.75;

// Show landing sites
config.landing = {};
config.landing.show = true;
config.landing.ndviThres = 2;
config.landing.gradientThres = 3;
config.landing.buffer = 1800;
config.landing.intersect = true;
config.landing.opacity = 0.45;

// Settlements mode
config.multipleSettlements = false;

// Vis params
config.circleRadius = 5;
config.transitionTime = 500;

// Debug mode
config.layoutdebug = false;
