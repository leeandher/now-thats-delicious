# Learn Node

_A compliation of useful notes and tricks that could come in handy in the future. Better to be safe than sorry!_

---

## Managing Models

Models are created through the declaration of a database schema. Specifically for MongoDB, this can be done easily through the `mongoose` package. The `mongoose.Schema()` method will create a table schema through the object which you pass to, defaulting to strict mode. Here's an example:

```javascript
const mongoosee = require('mongoose'); //Import the mongoose package
mongoose.Promise = global.Promise; //Tell mongoose to use the global Promise object on it's DB interactions
const storeSchema = new mongoose.Schema({
  name: {
    type: String, //Only accept Strings
    trim: true, //Get rid of preceeding/terminating whitespace
    required: "Please enter a store name!" //Must be given
  },
  description: {
    type: String,
    trim: true
  },
  tags: [String] //Only accept an array of strings
});

//Export the storeSchema applied to a table entitled 'Store'
module.exports = mongoose.model("Store", storeSchema);
```

Models can also perform helpful operations on the data which is passed to it, depending on the action which is take. For example, the following snippet takes effect before the `.save()` metho is called on the `storeSchema`. If the `name` of the store has been modified, then create the slug, and move on.

```javascript
//The save method creates an entry in the storeSchema table
storeSchema.pre("save", function(next) {
  //Skip it and stop this function
  if (!this.isModified("name")) return next();
  //Create the slug
  this.slug = slug(this.name);
  next();
});
```

## Async/Await

Since JavaScript is an asynchronous scripting language, making requests to external resources is a problem, especially if multiple need to be made before any sort of user response. Modern javascript is way past _[Callback Hell](http://callbackhell.com/)_, since the introduction of the `global.Promise` object. Now, in order to make a bunch of calls, you can simply chain them:

```javascript
doSomething().then(function(result) {
  return doSomethingElse(result);
})
.then(function(newResult) {
  return doThirdThing(newResult);
})
.then(function(finalResult) {
  console.log('Got the final result: ' + finalResult);
})
.catch(failureCallback);
```
<small>Example credits to [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)</small>

But even this can get pretty confusing pretty fast. Another way to handle this is with `async` and `await` notation. To use this notation, preface the asyncronous function with the keyword `async` to denote the fact that a promise will be taking place inside. Then, simply put the keyword `await` infront of the call, in order to tell JavaScript not to continue until this response is completed. 

```javascript
//The finished message ill only log after the new store has been saved
exports.createStore = async (req, res) => {
  const store = new Store(req.body);
  await store.save(); //This line saves the new store to the database
  console.log('Finished!')
}
```

There is a trade off however; the error handling, which is critical when depending on external resources. Since physically impossible to write code without errors in it, the `async/await` calls need to be `try`'d in order to `catch` any errors in reading/writing to the database or API. This is because there is no callback function which naturally catches the error. However, there is a way of conveniently catching errors using a helper function.

```javascript
//This function is middlewawre which accepts a function
exports.catchErrors = fn => {

  //It then returns the output to a 'parent' function
  return function(req, res, next) {
    
    //The parent function outputs our input function followewd by .catch() in order to catch the error, and skip to the next middleware.
    //This error is caught in the next middlewawre
    return fn(req, res, next).catch(next);
  };
};
```

---
