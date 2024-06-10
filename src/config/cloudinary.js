const cloudinary = require('cloudinary').v2;

// Configurar cloudinary
const connectCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            api_key: process.env.CLOUDINARY_API_KEY
        });
        console.log("Conectado a cloudinary");
    } catch (err) {
        console.log("No se ha podido conectar a cloudinary");
    }
};

module.exports = { connectCloudinary }
