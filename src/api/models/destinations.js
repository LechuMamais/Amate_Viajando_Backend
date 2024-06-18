const mongoose = require('mongoose');

const destinationsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    images: [
        {
            order: { type: Number, required: true },
            imgObj: { type: mongoose.Types.ObjectId, required: true, ref: "images" }
        }
    ],
    tours: [
        {
            order: { type: Number, required: true },
            tourObj: { type: mongoose.Types.ObjectId, required: true, ref: "tours" }
        }
    ],
}, {
    timestamps: true,
    collection: "destinations"
});

const Destinations = mongoose.model("destinations", destinationsSchema);

module.exports = Destinations;
