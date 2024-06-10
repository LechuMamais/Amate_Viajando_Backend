const Tours = require("../models/tours");

const getTours = async (req, res, next) => {
    try {
        const tours = await Tours.find().populate('images');
        res.status(200).json(tours)
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const getTourById = async (req, res, next) => {
    try {
        const tour = await Tours.findById(req.params.id).populate('images');
        res.status(200).json(tour);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const createTour = async (req, res, next) => {
    try {
        const tour = await Tours.create(req.body);
        res.status(201).json(tour);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const updateTour = async (req, res, next) => {
    try {
        const tour = await Tours.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json(tour);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const deleteTour = async (req, res, next) => {
    try {
        const tour = await Tours.findByIdAndDelete(req.params.id);
        res.status(200).json(tour);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

module.exports = { getTours, getTourById, createTour, updateTour, deleteTour };