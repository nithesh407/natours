/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: '../config.env' });

const sendMail = async (options) => {
  //1) CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //Activate in gmail "less secure app" option
  });

  //2) Define the email options
  const mailOptions = {
    from: 'Nithesh Ravikumar <nitheshravikumar13631@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  //3) Actually send the mail

  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;
