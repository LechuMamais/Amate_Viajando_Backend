const mongoose = require('mongoose');

const destinationsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    heading: {type: String, required: true},
    description: {type: String, required: true},
    longDescription: {type: String, required: true},
    images: [{type: mongoose.Types.ObjectId, required: true, default: {}, ref: "images"}],
    tours: [{type: mongoose.Types.ObjectId, required: false, default: {}, ref: "tours"}],    
},{
    timestamps:true,
    collectionName: "destinations"
});

const Destinations = mongoose.model("destinations", destinationsSchema, "destinations");

module.exports = Destinations;