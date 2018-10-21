function autocomplete(input, latInput, lngInput) {
  //If there is no address, skip this
  if (!input) return;

  //Activate the Google Maps API Dropdown on the 'input' field
  const dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener("place_changed", () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });

  //Don't submit on 'enter' press
  input.on("keydown", e => {
    if (e.keyCode === 13) e.preventDefault();
  });
}
export default autocomplete;
