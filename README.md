# digenti-access

Routing experiments combining a routing API and remote sensing data.


This interfaces gives an overview of the accessibility of the settlements in the [Area of Interest in Colombia](https://docs.google.com/document/d/15N1pgERY4TUcnvck36jJFi3MvAZuxh8J-mOUpWDt-_w/edit?usp=sharing) using a routing API and remote sensing data.

## Accessibility

For each settlement, with standard routing:

- Accessibility by road (vehicle)
- Accessibility by path (walk)

If **not directly accessible** by road:

- Get nearest road
    - Distance
    - Elevation profile
    - Passable areas (%, polygons)
    - Walkable areas (%, polygons)
- Landing areas (within a distance from the settlement)

More info here:

- [Remote sensing-based accessibility](https://www.dropbox.com/s/rrpx3w3mq2a8qfh/160621_Remote_Sensing_based_Routing.pdf?dl=0)

## Data

The remote sensing data is based on the Tandem-X WorldDEM 10-m resolution digital elevation model (DEM) with complete coverage for the area of interest.

- [Data Wiki](https://docs.google.com/document/d/1rOW-6X6TNkypR-dgxWhZ4W7whIa5dxpPMbqCAW_iMPc/edit)
- [Data Formats](https://docs.google.com/spreadsheets/d/1igPn_mZqVaId_kqjcNPapB_qUvXkHo37GfP1JvSQrOs/edit?usp=sharing)

## Tools

### Geo tools

- [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/)
- [Turf.js](http://turfjs.org/)

### Routing

- [HERE Routing API](https://developer.here.com/rest-apis/documentation/routing)
