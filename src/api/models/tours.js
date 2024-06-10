const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
    name: {type: String, required: true},
    heading: {type: String, required: true},
    description: {type: String, required: true},
    longDescription: {type: String, required: true},
    images: [{type: mongoose.Types.ObjectId, ref: "images"}], // Cambiado a un array de ObjectId
}, {
    timestamps: true,
    collectionName: "tours"
});

const Tours = mongoose.model("tours", toursSchema, "tours");

module.exports = Tours;
