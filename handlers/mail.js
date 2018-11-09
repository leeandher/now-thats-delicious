const nodemailer = require("nodemailer"); //Sends the email
const pug = require("pug"); //Compiles the template
const juice = require("juice"); //Inlines the CSS
const htmlToText = require("html-to-text"); //Converts Email HTML to text
const promisify = require("es6-promisify"); //Converts Callbacks to ES6 Promises

//Create the nodemailer 'sender'
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

//Send an email
exports.send = async options => {
  const html = generateHTML(options.template, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: "Leander Rodrigues <noreply@leander.xyz>",
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
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
