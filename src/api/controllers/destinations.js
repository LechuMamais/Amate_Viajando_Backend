const { languages } = require("../../resources/languages");
const checkAllFieldsAreComplete = require("../../utils/checkAllFieldsAreComplete");
const { translateAllEmptyFields } = require("../../utils/translateAllEmptyFields");
const Destinations = require("../models/destinations");
const Images = require('../models/images');
const Tours = require("../models/tours");

const getDestinations = async (req, res, next) => {
    try {
        const { lang } = req.params;

        if (!languages.includes(lang)) {
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }

        const destinations = await Destinations.find()
            .populate('images.imgObj')
            .populate({
                path: 'tours.tourObj',
                populate: {
                    path: 'images.imgObj'
                }
            });

        const result = destinations.map(destination => ({
            _id: destination._id,
            images: destination.images,
            tours: destination.tours,
            country_name: destination.country_name,
            country_iso2code: destination.country_iso2code,
            ...destination[lang], // Extraer las propiedades del idioma solicitado
            tours: destination.tours.map(tour => ({
                order: tour.order,
                tourObj: {
                    ...tour.tourObj?.[lang],
                    images: tour.tourObj?.images,
                    _id: tour.tourObj?._id
                },
            }))
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener los destinos:", error);
        res.status(500).json({ message: error.message });
    }
};

const getDestinationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { lang } = req.params;

        if (!lang == 'all' && !languages.includes(lang)) {
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }

        const destination = await Destinations.findById(id)
            .populate('images.imgObj')
            .populate({
                path: 'tours.tourObj',
                populate: {
                    path: 'images.imgObj'
                }
            });

        if (!destination) {
            return res.status(404).json({ message: "Destino no encontrado" });
        }
        if (lang == 'all') {
            res.status(200).json(destination)
        } else {
            const result = {
                _id: destination._id,
                images: destination.images,
                tours: destination.tours,
                country_name: destination.country_name,
                country_iso2code: destination.country_iso2code,
                ...destination[lang]
            };

            res.status(200).json(result);
        }
    } catch (error) {
        console.error("Error al obtener el destino:", error);
        res.status(500).json({ message: error.message });
    }
};

const createDestination = async (req, res) => {
    try {
        const { images, tours, country_name, country_iso2code } = req.body;

        const destinationData = {};
        languages.forEach(lang => {
            destinationData[lang] = req.body[lang] || {};
        });

        console.log('Country name: ', country_name);
        console.log('Country code: ', country_iso2code);

        const hasCompleteField = checkAllFieldsAreComplete(...Object.values(destinationData));

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        await translateAllEmptyFields(destinationData, ["name", "heading", "description", "longDescription"]);

        const imageRefs = await Promise.all(
            (images || []).map(async (img) => {
                const imgDoc = await Images.findById(img.imgObj);
                if (!imgDoc) {
                    throw new Error(`Imagen con id ${img.imgObj} y orden ${img.order} no encontrada.`);
                }
                return { order: img.order, imgObj: imgDoc._id };
            })
        );

        const tourRefs = await Promise.all(
            (tours || []).map(async (tour) => {
                const tourDoc = await Tours.findById(tour.tourObj);
                if (!tourDoc) {
                    throw new Error(`Tour con id ${tour.tourObj} y orden ${tour.order} no encontrado.`);
                }
                return { order: tour.order, tourObj: tourDoc._id };
            })
        );

        const newDestination = new Destinations({
            ...destinationData,
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

const updateDestination = async (req, res) => {
    try {
        const destination = await Destinations.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: "Destino no encontrado." });
        }

        const { country_name, country_iso2code, images, tours } = req.body;

        const destinationData = {};
        languages.forEach(lang => {
            destinationData[lang] = req.body[lang] || {};
        });

        const hasCompleteField = checkAllFieldsAreComplete(...Object.values(destinationData));

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        const updatedBody = await translateAllEmptyFields(destinationData, ["name", "heading", "description", "longDescription"]);

        const updatedDestination = await Destinations.findByIdAndUpdate(
            req.params.id,
            {
                ...updatedBody,
                country_iso2code,
                country_name,
                images: (images || []).map(img => ({
                    order: img.order,
                    imgObj: img.imgObj
                })),
                tours: (tours || []).map(tour => ({
                    order: tour.order,
                    tourObj: tour.tourObj
                }))
            },
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
