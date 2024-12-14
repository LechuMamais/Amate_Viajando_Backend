const mongoose = require('mongoose');
const { ISO2 } = require('../../resources/countriesISOCode');

const validCountryCodes = ISO2.map(country => country.code);
const validCountryNames = ISO2.map(country => country.name);

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
        required: true,
        enum: validCountryNames,
        validate: {
            validator: function (value) {
                return validCountryNames.includes(value);
            },
            message: props => `${props.value} is not a valid country name!`
        }
    },
    country_iso2code: {
        type: String,
        required: true,
        enum: validCountryCodes,
        validate: {
            validator: function (value) {
                return validCountryCodes.includes(value);
            },
            message: props => `${props.value} is not a valid ISO2 code!`
        }
    }
}, {
    timestamps: true,
    collection: "destinations"
});

const Destinations = mongoose.model("destinations", destinationsSchema);

module.exports = Destinations;
