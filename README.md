# DIGENTI Apps

Open-source web-based tool for area accessibility assessment in the context of disaster management – based on satellite data and geovisualization.

The tool gives an overview of the accessibility of the settlements in the [Area of Interest in Colombia](https://docs.google.com/document/d/15N1pgERY4TUcnvck36jJFi3MvAZuxh8J-mOUpWDt-_w/edit?usp=sharing) using a routing API and remote sensing data.

Moreover, the repository includes a set of snippets and examples, including routing experiments combining a routing API and remote sensing data.

## Accessibility Interface

The Accessibility Interface is located in `app-access`.

## Remote sensing-based Routing

The interface visualizes for each settlement:

- Accessibility by road (vehicle)
- Accessibility by path (walk)

<img width="1324" alt="Area accessibility overview" src="https://github.com/FH-Potsdam/digenti-apps/assets/859148/a3c1888d-97e3-4ff5-b827-a7b4095f8646">
<img width="1324" alt="Settlement reachability" src="https://github.com/FH-Potsdam/digenti-apps/assets/859148/ebcceaae-66e4-49a1-a45e-c1bfbf73f287">

If a settlement is **not directly accessible** by road:

- Provide accessibility data to the nearest road:
    - Distance
    - Elevation profile
    - Passable areas (%, polygons)
    - Walkable areas (%, polygons)
- Helicopter landing areas (within a given distance from the settlement)

<img width="1324" alt="Missing settlement reachability" src="https://github.com/FH-Potsdam/digenti-apps/assets/859148/6dbadf05-6ff5-44c5-a57c-228c4fcf6836">
<img width="1324" alt="Potential helicopter landing sites" src="https://github.com/FH-Potsdam/digenti-apps/assets/859148/638af0bf-cf43-4a32-ae99-fb404623cae2">
<img width="685" alt="DIGENTI_RemoteSensingRouting" src="https://github.com/FH-Potsdam/digenti-apps/assets/859148/ccda1126-f827-4644-840e-dd3da3f23620">

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
