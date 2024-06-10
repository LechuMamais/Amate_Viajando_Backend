const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Amate_Viajando_Images',
        allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'webp']
    },
});

const upload = multer({ storage });

module.exports = { upload };
