'use strict';

// import { Point } from '@maptiler/sdk';

const L = require('../../node_modules/leaflet/dist/leaflet');

const bringPopupToFront = function (e) {
  e.target.openPopup();
};

export const displayMap = (locations) => {
  // Initializing a map using Leaflet
  const map = L.map('map', {
    zoomControl: false,
    closePopupOnClick: false,
    scrollWheelZoom: false,
    // zoom: 1,
    zoomAnimationThreshold: 20,
  }).setView([0, 0], 0);

  L.tileLayer(
    'https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=qdEkSuB4INzAuV7cx10X',
    {
      attribution:
        '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    },
  ).addTo(map);

  // Using Maptiler Cloud as the basemap provider
  // const key = 'qdEkSuB4INzAuV7cx10X';
  // const mtLayer = L.maptilerLayer({
  //   apiKey: key,
  //   style: L.MaptilerStyle.VOYAGER.LIGHT, // optional
  // }).addTo(map);

  // To be used to set up bounds on the map
  let bounds = [];

  // Creating markers for each location on the tour
  locations.forEach((location, i) => {
    const [lng, lat] = location.coordinates;
    const myIcon = L.divIcon({ className: 'marker' });
    const popup = L.popup([lat, lng], {
      autoClose: false,
      closeOnClick: false,
      closeOnEscapeKey: false,
      content: `<span class='mapboxgl-popup-content'>Day ${location.day}: ${location.description}</span>`,
      className: 'mapboxgl-popup ',
      interactive: true,
      autoPan: true,
      autoPanPadding: [20, 20],
    }).openOn(map);

    L.marker([lat, lng], {
      icon: myIcon,
    })
      .addTo(map)
      .bindPopup(popup)
      .on('click', bringPopupToFront);

    bounds.push([lat, lng]);
  });

  // Bounding the map to the locations on the tour
  const latlngBound = L.latLngBounds(bounds).pad(0.4);
  map.fitBounds(latlngBound, {
    animate: true,
    duration: 0.9,
    noMoveStart: false,
  });
};

// const locations = JSON.parse(map.dataset.locations);
// displayMap(locations);
