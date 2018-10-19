# Learn Node

_A compliation of useful notes and tricks that could come in handy in the future. Better to be safe than sorry!_

---

## MongoDB and ENV

In order to set up a MongoDB database (or any sort of databse for that matter), it's best practice to create a `.env` file, which contains the app's sensitive information

```env
DATABASE=mongodb://user:pass@host.com:port/database
PORT=7777
MAP_KEY=456123
SECRET=twizzlers
```

The `dotenv` node package is used to reference the `.env` file. It stores the data for access as a `process.env` object (created by calling `require('dotenv').config({path: filename.env})`).

The template for the database connection is used in mongoDB specifically in order to connect. For example, a `localhost` example (without a username/password), connecting to the `admin` database on port `27017` would be:

```
DATABASE=mongodb://localhost:27017/admin
```

Another important note, if you are setting up MongoDB on your local machine (instead of using a DB as a Service), and it happens to be running Windows, you will have to create a `C:\data\db` directory in order setup. To actually make it run, navigate to `C:\Program Files\MongoDB\Server\versionNumber\bin` and run `mongod` in a terminal. Congrats, you've spun up your database. 😃😃

---

## Routing

Routing is the way of sending our app/user different sets of data based on the URL path. For this project, `express.Router()` is used for this.

The router let's us specify the file path, and the type of request, followed by what to do with it. See the following:

```javascript
const router = express.Router();
//Perform this function for GET requests on homepage
router.get("/", (req, res, next) => {
  //req -> request object
  //res -> response object
  //next -> operation for middleware (more on this later)
  //req.query -> references localhost:PORT/?key1=value1&key2=value2
  //res.send() -> sends page data, ex: <p>Hello World!</p>
  //res.json() -> send JSON object (for API calls)
  const me = {
    name: "leander",
    age: 19,
    other: req.query.other
  };
  res.json(me);
});
//Use the controller's addPage function to control the POST requests on localhost:PORT/add
router.post("/add", storeController.addStore);
```

---

## Templating, Helpers and Mixins

**Templates** are a useful way to write reusable markup. For this app, the templating language used is `pug` (or formerly known as `jade`). which was chosen for its seemless integration with JavaScript.

The syntax of the templating language depends on which is chosen, but regardless, the core concept is the same; create a page which can accept data to dynamically create a new page.

```javascript
//Use pug as the template engine
app.set("view engine", "pug");

//This is a controller, which is helpful for MVC programming. More on this later...
exports.addStore = (req, res) => {
  //The response renders a template 'editStore.pug', and passes the template data
  res.render("editStore", { title: "Hello World!" });
};

/*  ---- Within editStore.pug ----  */

extends layout //Use the layout.pug template

block content //Change the 'content' block of layout.pug to the following markup
  //Reference the supplied parameters
  h2 #{title}
  h3= title
```

**Helpers** are another useful way to write templates. They allow you to perform some basic functionality/operations on the incoming data for each template. Simple things like loops over arrays, key-value destructuring, comparators, and conditionals are all available for most templating languages.

In order to create your own helpers, simple put them in a `helpers.js` file as:

```javascript
exports.example = "example value";
exports.dump = obj => JSON.stringify(obj, null, 2);
```

or something of the sort. Then, using middleware, they can be used in Express:

```javascript
//Import the file
const helpers = require("./helpers.js");

//Add it as a helper
app.use((req, res, next) => {
  res.locals.h = helpers;
  next();
});

//Use it throught the app (ex. pug)
h1 This is how a helper is used: #{h.example}
```

**Mixins** are a way of extending the modularity even further, essentially creating reusable components for multiple templates. For example, if your `updateStore.pug` template, and `addStore.pug` template both present the same form, with the same parameters, a `_storeForm.pug` mixin is probably a good idea.

_Note: To distinguish mixins, it is recommended to store them in a separate directory, with filenames starting with an underscore._

In pug, mixins can be referenced and used as follows:

```pug
extends layout

include mixins/_storeForm

block content
  h1 Preceding data
  +storeForm({store: 'Cool Cats'})

<!-- Within _storeForm.pug -->
//- Declared similar to JS functions
mixin storeForm(store = '')
  //- Your template with its param values
  h1= store
```

**Take advantage of templating, it's a useful tool!**

---

## MVC and Controllers

MVC programming is a code architecture concept. It stands for **Model**, **View**, **Controller**. It outlines a way of developing applications to process logic and display content to end users by separating the code into three distinct areas.

The **model** refers to the code layer which performs operations on the backend. This can be the seen as the requests for fetching/querying the database. In an analogy, the model is the _pizza place_.

The **view** is what the user sees. We think of the view as the templates and display. For the purpose of this application, these are the `.pug` files. We must display all of our information back to the user through the view. In an analogy, the view is _your apartment_.

The **controller** is the bridge between the **model** and the **view**. It gets data from the model, then passes it on to the view. In an analogy, the controller is the _delivery driver_.

//Analogy

By keeping the controllers seperate from the model and view, we allow for a modular application, with reusable bits of code. We can create a controller by creating a seperate file and exporting its functionality:

```javascript
/*  ---- Model ----  */
const storeContoller = require("./storeController");

router.get("/", storeController.homepage);
router.get("/add", storeController.addStore);

/*  ---- View ----  */
index.pug;
editStore.pug;

/*  ---- Controller ----  */
exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { ...params });
};
```

---

## Middleware and Error Handling

**Middleware** is a term used to refer to the processing or functionality that goes on _after_ the request, but _before_ the response. Middleware is the main way of performing bulk operations through express, and it's passed simply as just another parameter to a normal controller function. Take the following code as an example.

```javascript
//Within the exampleController.js file
exports.myMiddleware = (req, res, next) => {
  req.myMiddleWareVariable = "Example";
  console.log("This is an");
  next();
};

exports.myResponse = (req, res, next) => {
  console.log(req.myMiddleWareVariable);
  res.send("Finished");
};

//Then we would call upon the middleware as shown:
//router.get(route, controller)
router.get(
  "/example",
  exampleController.myMiddleWare,
  exampleController.myResponse
);

//When navigating to the route /example
//  -> console: This is an
//  -> console: Example
//  -> page: Finished
```

That is an example of route-specific middleware, but Express also has the capability for global middleware. This allows every single request to pass through the same middleware, enabling application-wide functionality.

This is called through the function `app.use()`.

```javascript
//app.use(middlewareFunction)
app.use(setTheseVariables);
app.use(gatherTheseStaticAssets);
app.use(makeThisDBFolder);
```

We can use middleware for **error handling** as well. If we queue up a bunch of functions to run before a certain operation, we can handle the edge cases on returns. For example:

```javascript
//All routes starting at /admin use the adminRoutes router
const adminRoutes = require("./adminRoutes");
// app.use("/", routes);
app.use("/admin", adminRoutes);
app.use(errorHandlers.notFound);
```

Since that line is commented, if we navigate to anything other than `localhost:PORT/admin`, we will run into the fallback error handler: `errorHandlers.notFound`.

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
