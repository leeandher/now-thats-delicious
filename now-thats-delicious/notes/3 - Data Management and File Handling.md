# Learn Node

_A compliation of useful notes and tricks that could come in handy in the future. Better to be safe than sorry!_

---

## Location Data in MongoDB

In Module 5 of the course, we expand our database to take in location coordinates as well as the existing data. Since our schema defaults to _strict_ mode, we must change the schema in order to allow the addition of data.

```js
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a store name!"
  },
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply come coordinates"
      }
    ],
    address: {
      type: String,
      required: "You must supply an address!"
    }
  }
});
```

This is pretty useful for grouping data, since now we can reference specifics in the category of `location` (ex. `location.coordinates`, or `location.address`).

There are some **MongoDB Specific Quirks** in this Schema. Under the new `location` paramater, we default the value to a 'Point'. A point is a way of storing a location via longitude and latitude, and for MongoDB, _in that order!_.

The sad part is that since this database will be read/written to, we need to be able to enforce that default _'Point'_, regardless of whether or not it is updated/edited. To do that, we have to go to where the editing will take place, and change this.

```js
exports.updateStore = async (req, res) => {
  //Enforce the Point default type
  req.body.location.type = "Point";

  //Update a store's location, ensuring the Point type
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, //Return the new store, not the old one
    runValidators: true //Run the required validators against the model
  }).exec();
};
```

Going with this, remember that when making reference to fill these nested variables in `pug`, you cannot use the _dot_ notation for the object within a string, use the _square bracket_ notation instead.

```pug
label(for="address") Address
input(type="text" id="address" name="location[address]" value=(store.location && store.location.address))

<!-- Rememeber, MongoDB -> [Lng, Lat] -->
label(for="lng") Address Longitude
input(type="text" id="lng" name="location[coordinates][0]" value=(store.location && store.location.coordinates[0]) required)

label(for="lng") Address Latitude
input(type="text" id="lat" name="location[coordinates][1]" value=(store.location && store.location.coordinates[1]) required)
```

_Note:_ In this project, the required field flashes as validation errors if the field isn't filled when creating/editing/updating due to the `flashValidationErros` helper function.

---

## Using Frontend JS

Anything contained in our `./public/` directory is considered a clientside asset. In our case, if we want a Node App to integrate some front-end scripting, we can use **module** structure.

Within `./public/javascripts/` we should have our running JS file (ex. `delicious-app.js`), and another directory entitled `modules/`. In that `modules/` folder, we can export our frontend functions to be used.

See this example, which is used to autocomplete a location using the Google Maps API.

```js
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
```

Then, in the `delicious-app.js` file, we can import that function and use it!

```js
import "../sass/style.scss";

import { $, $$ } from "./modules/bling"; //Another module for $ --> document.querySelector
import autocomplete from "./modules/autocomplete";

autocomplete($("#address"), $("#lat"), $("#lng"));
```
