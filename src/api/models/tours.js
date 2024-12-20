const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
    name: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    eng: {
        name: { type: String, required: true },
        heading: { type: String, required: true },
        description: { type: String, required: true },
        longDescription: { type: String, required: true }
    },
    esp: {
        name: { type: String, required: true },
        heading: { type: String, required: true },
        description: { type: String, required: true },
        longDescription: { type: String, required: true }
    },
    ita: {
        name: { type: String, required: true },
        heading: { type: String, required: true },
        description: { type: String, required: true },
        longDescription: { type: String, required: true }
    },
    por: {
        name: { type: String, required: true },
        heading: { type: String, required: true },
        description: { type: String, required: true },
        longDescription: { type: String, required: true }
    },
    images: [
        {
            order: { type: Number, required: true },
            imgObj: { type: mongoose.Types.ObjectId, required: true, ref: "images" }
        }
    ],
}, {
    timestamps: true,
    collectionName: "tours"
});

const Tours = mongoose.model("tours", toursSchema, "tours");

module.exports = Tours;
