const Destinations = require("../models/destinations");
const Images = require('../models/images');
const Tours = require("../models/tours");

const getDestinations = async (req, res, next) => {
    try {
        const destinations = await Destinations.find()
            .populate('images.imgObj')
            .populate({
                path: 'tours.tourObj',
                populate: {
                    path: 'images.imgObj'
                }
            });

        destinations.forEach(destination => {
            destination.images?.sort((a, b) => a.order - b.order);
            destination.tours?.sort((a, b) => a.order - b.order);
            destination.tours?.forEach(tour => {
                tour.tourObj.images?.sort((a, b) => a.order - b.order);
            });
        });

        res.status(200).json(destinations);
    } catch (error) {
        return res.status(404).json(error);
    }
};

const getDestinationById = async (req, res, next) => {
    try {
        const destination = await Destinations.findById(req.params.id)
            .populate('images.imgObj')
            .populate({
                path: 'tours.tourObj',
                populate: {
                    path: 'images.imgObj'
                }
            })

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        // Ordenar las imágenes del destino
        destination.images.sort((a, b) => a.order - b.order);

        // Ordenar los tours del destino y las imágenes de cada tour
        destination.tours.sort((a, b) => a.order - b.order);
        destination.tours.forEach(tour => {
            if (tour.tourObj && tour.tourObj.images) {
                tour.tourObj.images.sort((a, b) => a.order - b.order);
            }
        });

        res.status(200).json(destination);
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: error.message });
    }
};

const createDestination = async (req, res) => {
    try {
        const { name, heading, description, longDescription, images, tours } = req.body;

        const imageRefs = await Promise.all(images.map(async (img) => {
            const imgDoc = await Images.findById(img.imgObj);
            if (!imgDoc) {
                throw new Error(`Image with id ${img.imgObj} and order ${img.order} not found`);
            }
            return { order: img.order, imgObj: imgDoc._id };
        }));

        const tourRefs = await Promise.all(tours.map(async (tour) => {
            const tourDoc = await Tours.findById(tour.tourObj);
            if (!tourDoc) {
                throw new Error(`Tour with id ${tour.tourObj} and order ${tour.order} not found`);
            }
            return { order: tour.order, tourObj: tourDoc._id };
        }));

        const newDestination = new Destinations({
            name,
            heading,
            description,
            longDescription,
            images: imageRefs,
            tours: tourRefs
        });

        await newDestination.save();

        res.status(201).json(newDestination);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateDestination = async (req, res, next) => {
    try {
        const destination = await Destinations.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(destination);
    } catch (error) {
        return res.status(404).json(error);
    }
};

const deleteDestination = async (req, res, next) => {
    try {
        const destination = await Destinations.findByIdAndDelete(req.params.id);
        res.status(200).json(destination);
    } catch (error) {
        return res.status(404).json(error);
    }
};

module.exports = { getDestinations, getDestinationById, createDestination, updateDestination, deleteDestination };
