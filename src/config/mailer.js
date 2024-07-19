require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = (to, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Amate Viajando - Verificación de correo electrónico 🙌🏽',
    html: `
      <div style="text-align: center;">
        <img src="url_del_logo" alt="Logo" style="width: 150px;"/>
        <h1>Verificación de correo electrónico </h1>
        <h3>Gracias por registrarte! Por favor, verifica tu correo electrónico usando el código a continuación:</h3>
        <h2>${token}</h2>
        <p>Introduce este código en nuestra aplicación para completar tu registro.</p>
        <img src="url_de_la_imagen" alt="Imagen" style="width: 100%;"/>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
