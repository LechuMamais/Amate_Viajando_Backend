const Destinations = require("../models/destinations");

const getDestinations = async (req, res, next) => {
    try {
        const destinations = await Destinations.find().populate('images');
        res.status(200).json(destinations)
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const getDestinationById = async (req, res, next) => {
    try {
        const destination = await Destinations.findById(req.params.id)
            .populate('images')
            .populate({
                path: 'tours',
                populate: {
                    path: 'images'
                }
            });
        res.status(200).json(destination);
    } catch (error) {
        return res.status(404).json(error);
    }
};


const createDestination = async (req, res, next) => {
    try {
        const destination = await Destinations.create(req.body);
        res.status(201).json(destination);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const updateDestination = async (req, res, next) => {
    try {
        const destination = await Destinations.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json(destination);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const deleteDestination = async (req, res, next) => {
    try {
        const destination = await Destinations.findByIdAndDelete(req.params.id);
        res.status(200).json(destination);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

module.exports = { getDestinations, getDestinationById, createDestination, updateDestination, deleteDestination };