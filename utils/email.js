const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');

// const dotenv = require('dotenv');
// dotenv.config({path: '../config.env'});

// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// exports.sendEmail = (to, subject, text) => {
//     const msg = {
//         to, // Change to your recipient
//         from: 'dpovedat@unal.edu.co', // Change to your verified sender
//         subject,
//         text,
//         html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//       }
//       sgMail
//         .send(msg)
//         .then(() => {
//           console.log('Email sent')
//         })
//         .catch((error) => {
//           console.error(error)
//         })
// }


const sendEmail = async options => {
    // 1) Createa transporter
    const transporter = nodemailer.createTransport({
        // service: "Gmail",
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }

        // Activate in gmail "less secure app" option
    });
   // 2) Define the email options

   const mailOptions = {
    from: 'UNBiters <dpovedat@unal.edu.co>',
    to: options.correo,
    subject: options.subject,
    text: options.message,
    // html:
   }

   // 3) Actually send the email
   await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;

