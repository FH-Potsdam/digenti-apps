# DIGENTI Apps

Open-source web-based tool for area accessibility assessment in the context of disaster management – based on satellite data and geovisualization.

The tool gives an overview of the accessibility of the settlements in the [Area of Interest in Colombia](https://docs.google.com/document/d/15N1pgERY4TUcnvck36jJFi3MvAZuxh8J-mOUpWDt-_w/edit?usp=sharing) using a routing API and remote sensing data.

Moreover, the repository includes a set of snippets and examples, including routing experiments combining a routing API and remote sensing data.

## Accessibility Interface

The Accessibility Interface is located in `app-access`.

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

<img width="758" alt="DIGENTI_RemoteSensingRouting" src="https://github.com/FH-Potsdam/digenti-apps/assets/859148/6cad906f-8e7e-4f75-8b20-2f6689599f70">

## Dependencies

This is the client part of a modular architecture. In order to access the satellite data you'll need to install the following packages:

- [DIGENTI Framework: Libs, commons and utils](https://github.com/FH-Potsdam/digenti-framework)
- [DIGENTI Server and REST API](https://github.com/FH-Potsdam/digenti-api)
- [PostGRE / PostGIS Database](https://redmine.geoway.de/projects/digenti/wiki/Notes)

## Docs

Further information of the project can be found in the following research articles and documentation:

- [Project Documentation](https://github.com/FH-Potsdam/digenti-doc)
- [Visualization and Interaction with Multiple Devices. A Case Study on Reachability of Remote Areas for Emergency Management – Jordi Tost & Frank Heidmann, i-com Journal of Interactive Media](https://doi.org/10.1515/icom-2017-0027)

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
