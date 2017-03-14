var config = {};

// Mapbox
config.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';

// Tabletop
config.tabletop = false;

// DIGENTI API
// config.apiBase = "http://jorditost.local:61002/api";
config.apiBase = "http://localhost:61002/api";

// Map config
config.map = {};
config.map.zoom = 11.2;
config.map.center = [-73.09, 10.422];

// Theme
config.theme = "dark"; // Possible values: 'light', 'dark'. Default: 'light'

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
config.circleRadius = 6;
config.transitionTime = 500;

// Debug mode
config.layoutdebug = false;
