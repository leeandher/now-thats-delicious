# Learn Node

_A compliation of useful notes and tricks that could come in handy in the future. Better to be safe than sorry!_

---

## Introduction

Databases are used for their ability to manipulate and provide/take data from the end user. The most practical and widespread use of these interactions must be done through a REST API, since we never want to give direct access to anyone who isn't authorized. An API like this provides a line of communication between our app and the data it stores.

**Asyncronous JavaScript and XML** just describes the way in which we fetch data. It's done asyncronously, so we have to wait until the data returns before we continue using it.

An **Application Programming Interface (API)** is a technical way of describing how different technologies speak to one other. It determines the way of getting and providing information between programs.

The type of API is referred to as **Representational State Transfer**, and it describes the set of constrains we use when using the API. In most cases, all you need to know is that any calls don't actually pass you the data itself, but rather a _representation_ of the data. You can then manipulate it however you like, and pass it back to the data base performing any of the HTTP CRUD (Create, Read Update, Delete) methods: `GET`, `POST`, `PUT`, `DELETE`, etc.

## Creating Indexes for Querying

When working with databasess asyncronously (AJAX) we always have to think about the time it would take to deliver our data to the user. If there is any way we can make that faster, we should look into it. Thankfully, most databases come built-in with a feature to make our querying that much faster. These are referred to as _indexes_.

In essence, indexes are just a database's way of identifying which fields will be queried most often, and sorting them for querying in a faster way. We simply tell our database to be prepared for lots of queries on this set of fields, and it takes care of the rest. Take the following example:

```js
//Within our Store.js Schema

//Define our indexes
storeSchema.index({ name: "text" });
```

Take note, indexing must always take place on the schema, it isn't some sort of parameter that the user should be able to toggle. We have to understand how our data collection will be called upon when we define our indexes.

For MongoDB we've defined our type of index as a `text` index, which means we will be searching through the string on the field `name` for our documents.

Fairly straight forward, but we can also create special indexes for searching dynamically through multiple fields. These are referred to as **compound indexes**.

```js
//Within our Store.js Schema

//Define our indexes
//We've indexed these fields into a 'compound index'
//This will let us search through both fields at once
storeSchema.index({ name: "text", description: "text" });
```

In essence, now when we search via our `$text` index, we will be able to check both the name and description for whatever the query may be! Check out the following use case:

```js
exports.searchStores = async (req, res) => {
  const stores = await Store
    //Find stores that match the query
    .find(
      {
        $text: {
          $search: req.query.q
        }
      },
      //Create a projection
      { score: { $meta: "textScore" } }
    )
    //Sort them by the projection
    .sort({
      score: { $meta: "textScore" }
    })
    //Limit to only five results
    .limit(5);
  res.json(stores);
};
```

---

## Query Projections

Short little note here, but we can refer to the above example. A projection is just an _invisible_ field that can be added to our query at run time, usually containing _metadata_. Now that can be confusing, but if we break up the example and look at it, we can see it's not that bad.

So in our `.find()` model method, we are using two paramaters:

```js
/* .find( 
  conditions --> Object, required
  [projection] --> Object/String, optional
)*/
```

In this case our condition is:

```js
//Query our data
{
  $text: {
    $search: req.query.q;
  }
}
```

and our projection is

```js
//Create a projection
{
  score: {
    $meta: "textScore";
  }
}
```

The above object says that we're adding a new field called _score_ and we're going to assign it a value derived from metadata (`$meta`) which is its _textScore_. In this case, the textScore is just how many occurances of our query term show up in the document. Then we use that info to sort!

```js
//Sort them by the projection
.sort({
  score: { $meta: "textScore" }
})
```

Now what we've done is sort our data by which document has the highest `textScore`. Essentially, whichever has the most occurances of our key term, that one gets preference!

---
