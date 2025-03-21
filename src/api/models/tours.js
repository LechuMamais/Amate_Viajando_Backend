const mongoose = require('mongoose');
const { languages } = require("../../resources/languages");


const languageFields = {
    name: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true }
};

const languageSchema = languages.reduce((acc, lang) => {
    acc[lang] = languageFields;
    return acc;
}, {});

const toursSchema = new mongoose.Schema({
    ...languageSchema,
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
