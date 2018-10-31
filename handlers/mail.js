const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
const promisify = require("es6-promisify");

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

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

const generateHTML = (template, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${template}.pug`,
    options
  );
  const inlined = juice(html);
  return inlined;
};

// transport.sendMail({
//   from: "Leander Rodrigues <me@leander.xyz>",
//   to: "jordine.rae@gmail.com",
//   subject: "Just trying things out!",
//   html: "Hey I <strong>love</strong> you!",
//   text: "Hey I **love** you!"
// });
