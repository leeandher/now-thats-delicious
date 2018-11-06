import axios from "axios";
import { $ } from "./bling";

const mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 10
};

function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    if (!places.length) {
      return alert("No places found!");
    }

    //Create the bounds
    const bounds = new google.maps.LatLngBounds();

    //Create the pins on the map
    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      //After each place, expand the bounds to fit it
      bounds.extend(position);
      const marker = new google.maps.Marker({
        map,
        position
      });
      marker.place = place;
      return marker;
    });

    //Now use the bounds to zoom and center the map
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  //Make our map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
}

export default makeMap;

// navigator.geolocation.getCurrentPosition
