const nodemailer = require("nodemailer");

const sendMail = (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Youssef Meskini <info@youssefmeskini.me>",
    to: options.email,
    subject: options.subject,
    text: options.text,
    // html:
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendMail;
