const { getTranslationFromOpenAI } = require("../../services/getTranslationFromOpenAI");
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
        const {
            name,
            heading,
            description,
            longDescription,
            country_iso2code,
            country_name,
            images,
            tours,
        } = req.body;

        const baseLang = "esp";

        if (!name || !heading || !description || !longDescription) {
            return res.status(400).json({
                message: "El nombre, heading, descripción y descripción larga son obligatorios.",
            });
        }

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

        // Traducir usando OpenAI
        const translations = {};
        const languages = ["eng", "ita", "por"];
        const fieldsToTranslate = { name, heading, description, longDescription };

        for (const lang of languages) {
            translations[lang] = {};

            for (const [field, value] of Object.entries(fieldsToTranslate)) {
                const translationResponse = await getTranslationFromOpenAI(lang, value);

                if (translationResponse.role !== "assistant" || !translationResponse.content) {
                    throw new Error(
                        `Error al traducir '${field}' al idioma '${lang}': ${translationResponse.refusal || "Error desconocido"}`
                    );
                }

                translations[lang][field] = translationResponse.content.trim();
            }
        }

        // Crear un nuevo destino
        const newDestination = new Destinations({
            name,
            heading,
            description,
            longDescription,
            esp: { name, heading, description, longDescription },
            eng: translations.eng,
            ita: translations.ita,
            por: translations.por,
            country_iso2code,
            country_name,
            images: imageRefs,
            tours: tourRefs,
        });

        // Guardar en la base de datos
        await newDestination.save();

        res.status(201).json(newDestination);
    } catch (error) {
        console.error("Error al crear el destino:", error);
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
