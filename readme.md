# Now That's Delcious!

Hey there, and welcome to the repository for _Now That's Delicious!_ This project is a singple page application I developed in an attempt to learn how to use JavaScript to create the backend of a site! It takes advantage of **Node**, **Express**, and **MongoDB**, and definitely keeps true to traditional **MVC** design principals. 

I also recorded some notes while going through the development process which you can check out over [here](https://github.com/leeandher/programming-notes). Lastly, you can check out the finished product over at [https://now-thats-delicious-leeandher.herokuapp.com](https://now-thats-delicious-leeandher.herokuapp.com).

Since it's hosted on a free-tier heroku dyno, it might take about 25-30 seconds for it's initial spin up! These free server instances fall asleep after 30 min of inactivity 😅😅😅!

## Using the app

Haven't you ever wanted a place to keep track of your favourite local eateries? Well this app is just for you! Upon launch, you'll be greeted a bunch of _stores_ that've been uploaded by other users. The descriptions, images, reviews, and locations are all specified by the user.

For you to get started, simply make an account by clicking on _register_. Once you set up an account you can now _add_ a new store, _edit_ an existing one, or start _reviewing_. You can review with a simple _like_ or perhaps, leave a review (along with a star-rank out of 5)! These reviews all contribute to the store's overall score on the **Top** page!

The search bar is tailored to the store name, and description allowing you to search for things like 'Coffee' or 'beer' with ease! The map will also show you all the stores in a given location, try 'Hamilton' for the best results. Lastly, incase you ever forget your password, the app has a 'Forgot your Password' work flow which will easily get you back up and running!

## How it works

This app was written almost entirely in **Node/Express** and with best practices kept through **MVC** design patterns. Express handles how we specify routes, and from there we pass the code along to `controllers` who run the middleware for each function we use.

The `controllers` use the `exports` system to control the _models_ as well as render the views. For a templating engine, we use `pug` since it integrates with helper functions, and javascript seemlessly. The models are specified in `MongoDB` and with the help of the _mongoose_ npm library, wire the data throughout the whole application.

Since it's being hosted on a heroku dyno, the app also uses an AWS S3 bucket to handle the storage of images in a fast, convenient way, allowing for easy links and upload!

## Creds

This app was developed through the help of a wonderful course by [Wes Bos](https://wesbos.com) entitled [Learn Node](learnnode.com). In case you've just found this repository in a similar attempt to learn how to develop backend JS applications, I definitely recommend the course and wish you the best of luck!

