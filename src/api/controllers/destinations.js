const { checkAllFieldsAreComplete } = require("../../utils/checkAllFieldsAreComplete");
const { translateAllEmptyFields } = require("../../utils/translateAllEmptyFields");
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

        res.status(200).json(destination);
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: error.message });
    }
};

const createDestination = async (req, res) => {
    try {
        const { eng, esp, ita, por, images, tours, country_name, country_iso2code } = req.body;

        const hasCompleteField = checkAllFieldsAreComplete(eng, esp, ita, por);

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        await translateAllEmptyFields(req.body);

        const imageRefs = await Promise.all(
            images.map(async (img) => {
                const imgDoc = await Images.findById(img.imgObj);
                if (!imgDoc) {
                    throw new Error(`Imagen con id ${img.imgObj} y orden ${img.order} no encontrada.`);
                }
                return { order: img.order, imgObj: imgDoc._id };
            })
        );

        const tourRefs = await Promise.all(
            tours.map(async (tour) => {
                const tourDoc = await Tours.findById(tour.tourObj);
                if (!tourDoc) {
                    throw new Error(`Tour con id ${tour.tourObj} y orden ${tour.order} no encontrado.`);
                }
                return { order: tour.order, tourObj: tourDoc._id };
            })
        );

        const newDestination = new Destinations({
            eng,
            esp,
            ita,
            por,
            country_name,
            country_iso2code,
            images: imageRefs,
            tours: tourRefs,
        });

        await newDestination.save();

        res.status(201).json(newDestination);
    } catch (error) {
        console.error("Error al crear el destino:", error);
        res.status(400).json({ message: error.message });
    }
};

const updateDestination = async (req, res, next) => {
    try {
        const destination = await Destinations.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: "Destino no encontrado." });
        }

        const { eng, esp, ita, por } = req.body;

        const hasCompleteField = checkAllFieldsAreComplete(eng, esp, ita, por);

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        const updatedBody = await translateAllEmptyFields({ eng, esp, ita, por });

        const updatedDestination = await Destinations.findByIdAndUpdate(
            req.params.id,
            { ...req.body, ...updatedBody },
            { new: true }
        );

        res.status(200).json(updatedDestination);
    } catch (error) {
        console.error("Error al actualizar el destino:", error);
        res.status(500).json({ message: error.message });
    }
};

const deleteImageFromDestination = async (req, res, next) => {
    const { destination_id, image_id } = req.params;
    try {
        const destination = await Destinations.findById(destination_id);
        if (!destination) {
            return res.status(404).json({ message: "Destination no encontrado" });
        }

        let newImagesArray = [];
        destination.images.forEach(image => {
            if (image.imgObj != image_id) {
                newImagesArray.push(image)
            }
        })

        destination.images = [];
        destination.images = newImagesArray;

        const updatedDestination = await Destinations.findByIdAndUpdate(destination_id, destination, { new: true })
        res.status(200).json(updatedDestination);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el Destination", error });
    }
}


const deleteDestination = async (req, res, next) => {
    try {
        const destination = await Destinations.findByIdAndDelete(req.params.id);
        res.status(200).json(destination);
    } catch (error) {
        return res.status(404).json(error);
    }
};

module.exports = { getDestinations, getDestinationById, createDestination, updateDestination, deleteImageFromDestination, deleteDestination };
