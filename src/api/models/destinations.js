const mongoose = require('mongoose');
const { ISO2 } = require('../../resources/countriesISOCode'); // Importa tu lista de códigos ISO2

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
    country_name: {
        type: String,
        validate: {
            validator: function (value) {
                if (!value) return false;
                return ISO2.some(country => country.name === value);
            },
            message: props => props.value
                ? `${props.value} is not a valid country name`
                : `Country name is required`
        }
    },
    country_iso2code: {
        type: String,
        validate: {
            validator: function (value) {
                if (!value) return false;
                return ISO2.some(country => country.code === value);
            },
            message: props => props.value
                ? `${props.value} is not a valid ISO2 code`
                : `Country ISO2 code is required`
        }
    },
}, {
    timestamps: true,
    collection: "destinations"
});

const Destinations = mongoose.model("destinations", destinationsSchema);

module.exports = Destinations;