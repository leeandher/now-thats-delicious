## Learn Node

_A compliation of useful notes and tricks that could come in handy in the future. Better to be safe than sorry!_

---

//Note on ENV
//Note on MongoDB Setup

```
// router.get("/reverse/:name", (req, res) => {
// const reverse = [...req.params.name].reverse().join("");
// res.send(reverse);
// });
```

//Note on Routing
//Note on Templating and Templating with Pug
//Note on MVC and Controllers
//Note on Middleware
//after the request but before the response
--- global middleware (for every request) most of app.js

--- app.use is global

app.use errorhandlers
