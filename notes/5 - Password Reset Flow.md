# Learn Node

_A compliation of useful notes and tricks that could come in handy in the future. Better to be safe than sorry!_

---

## Accepting User Input

When you have to reset the password for existing user accounts, the method to do so is through a specific url with `POST` handling. In the case of this project, we add an extra form to the login page using a mixin entitled `forgotForm`, which will send the user to `/account/forgot`.

```pug
<!-- View -->
form(action="/account/forgot")
    h2 I forgot my password!
    label(for="email") Email Address
    input(type="email" name="email" required)
    input.button(type="submit" value="Send a Reset")
```

```js
// Route Handling
router.post("/account/forgot", catchErrors(authController.forgot));
```

This route is only setup to handle a `POST` request, since it requires the email (`usernameField`) which the user is trying to reset. Nothing needs to be rendered here, instead we need to perform the three steps responsible for reseting a password in the backend. In the example, this is done entirely through the `authController`'s `forgot` method.

---

## Handling Reset Through Tokens

There are four steps which should be taken when providing the user with a password reset method. They are as follows:

1. See if the user's email is in the database
2. Add a reset token and expiry on their account
3. Send them an email with the token (usually as a URL)
4. Redirect them to the login page

---

### Step 1

Step 1 is easy enough with the `mongoose` package using the `.findOne` method on the `User` schema. If no user is found, the process ends here, since there is no associated account.

```js
//1. See if that user's email is in the DB
const user = await User.findOne({ email: req.body.email }); //via the forgotForm
if (!user) {
    req.flash(
        "error",
        "🤷‍ Coudn't find an account associated with that email 🤷‍"
    );
    return res.redirect("/login");
}
```

**NOTE**: You should take into consideration how you communicate the lack of associated account to the user. Saying that there is '_No account associated with that email_' will disclose information to the user which might be sensitive. If this is, consider instead always displaying that '_An email has been sent_' regardless. **However**, note that this may confuse users who forgot which email they've signed up with.

### Step 2

Step 2 is to add the reset token as well as it's expiry onto the user account. Well since we have all our data stored in a database, we can't just add whatever we want whenever, we need to modify the schema so that it accepts the new data. We simply add:

```js
// Model
const userSchema = new mongoose.Schema({
    ...
    resetPasswordToken: String, //They are not required, and random
    resetPasswordExpires: Date //They must become invalid after some time
});
```

Now we can modify the user's account in our database by adding a few lines. We use the `crypto` package which is actually built-in to Node.js without having to `npm install` it, so we can just add the dependency at the top of our controller. It's done as follows:

```js
// Controller
const crypto = require("crypto"); //Built-in sequence generator within Node.js

user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
user.resetPasswordExpires = Date.now() + 3600000; //1 hour
await user.save();
```

### Step 3

Step 3 is to send the user an email containing the reset token that has been added to their account. The email sending part is covered in the next note, so for now we can just imagine we got the link and move on.

### Step 4

Now, for Step 4, we just redirect the user to the `login` page while they wait on the email, which can be done easily through `res.redirect('/login')`. Now once they've used the email link to reset their password, they can enter it here and log in to the web app.

---

## Reset Token Verification

Inbetween Step 3 and 4, a lot of validation has to go on, besides just sending the email. We need to make sure that our randomly generated token, matches the token on their account from when they promtped the reset. After that, we need to ensure that the token isn't yet expired, followed by prompting them to enter/confirm a new password. To make things more complicated, in case there is anything wrong along the way, we need to handle and communicate those error to the user!
