import axios from "axios";
import { $ } from "./bling";

const mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 10
};

function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios
    .get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data;
      if (!places.length) {
        return alert("No places found!");
      }

      //Create the bounds
      const bounds = new google.maps.LatLngBounds();

      //Create the info window
      const infoWindow = new google.maps.InfoWindow();

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

      //Show info window on each marker (on click event)
      markers.forEach(marker =>
        marker.addListener("click", function() {
          const html = `
        <div class="popup">
          <a href="/stores/${this.place.slug}">
            <img src="/uploads/${this.place.photo || "store.png"}" alt="${
            this.place.name
          }"/>
            <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
          infoWindow.setContent(html);
          infoWindow.open(map, this);
        })
      );

      //Now use the bounds to zoom and center the map
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    })
    .catch(console.error);
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  //Make our map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    loadPlaces(
      map,
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
  });
}

export default makeMap;

// navigator.geolocation.getCurrentPosition
