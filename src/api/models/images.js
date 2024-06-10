const mongoose = require('mongoose');

const imagesSchema = new mongoose.Schema({
    name: {type: String, required: true},
    url: {type: String, trim: true, required: true},
    alt: {type: String, required: true},
    description: {type: String, required: false},
},{
    timestamps:true,
    collectionName: "images"
});

const Images = mongoose.model("images", imagesSchema, "images");

module.exports = Images;