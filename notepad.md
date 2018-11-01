## Actual Jotted Notes

In order to ensure an object property exists before calling on its children, you can use the `&&` operator to check before causing a `TypeError`.

```js
const obj = {
  loc: {
    address: {
      type: String,
      required: "You must supply an address!"
    }
  }
};
console.log(obj.loc.coords && obj.loc.coords.length); //--> undefined
console.log(obj.loc.coords.length); //--> TypeError

obj.loc.coords = [45.789234, -135.123456];

console.log(obj.loc.coords && obj.loc.coords.length); //--> 2
console.log(obj.loc.coords.length); //--> 2
```

At any point in a node script, you can use the variable `__dirname` which will reference the folder file location in which the call is being made. This is useful for grabbing templates, images, or other files from other relative locations, as seen in the following example.

```js
exports.send = async options => {
  const html = generateHTML(options.template, options);
  //... some functionality
};

//Generate HTML via a template
const generateHTML = (template, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${template}.pug`,
    options
  );
  const inlined = juice(html);
  return inlined;
};
```

The above is also a good example of limiting exports in your javascript. Since we don't ever need to access the `generateHTML` function, it is not exported, and instead declared within the file for internal use only. This should be used whenever functionality needs to happen within a controller/handler, but not externally, which is a security benefit, but also just helps maintain your codebase. You can think of these guys like your inner '_helper_' functions.
