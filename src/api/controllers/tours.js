const checkAllFieldsAreComplete = require("../../utils/checkAllFieldsAreComplete");
const { translateAllEmptyFields } = require("../../utils/translateAllEmptyFields");
const Tours = require("../models/tours");

const getTours = async (req, res, next) => {
    try {

        const { lang } = req.params;

        if (!languages.includes(lang)) {
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }
        const tours = await Tours.find().populate('images.imgObj');

        const result = tours.map(tour => ({
            _id: tour._id,
            images: tour.images,
            ...tour[lang]
        }));

        res.status(200).json(result)
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const getTourById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { lang } = req.params;

        if (!languages.includes(lang)) {
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }

        const tour = await Tours.findById(id)
            .populate('images.imgObj');

        if (!tour) {
            return res.status(404).json({ message: "Tour no encontrado" });
        }

        const result = {
            _id: tour._id,
            images: tour.images,
            ...tour[lang]
        };

        res.status(200).json(result);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const createTour = async (req, res, next) => {
    try {
        const { eng, esp, ita, por, images } = req.body;

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

        const newTour = new Tours({
            eng,
            esp,
            ita,
            por,
            images: imageRefs,
        });

        await newTour.save();

        res.status(201).json(newTour);
    } catch (error) {
        console.error("Error al crear el tour:", error);
        res.status(400).json({ message: error.message });
    }
};

const updateTour = async (req, res) => {

    try {
        const tour = await Tours.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: "Tour no encontrado" });
        };

        const { eng, esp, ita, por } = req.body;

        const hasCompleteField = checkAllFieldsAreComplete(eng, esp, ita, por);

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        const updatedBody = await translateAllEmptyFields({ eng, esp, ita, por });

        const updatedTour = await Tours.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body, updatedBody,
                images: images.map(img => ({
                    order: img.order,
                    imgObj: img.imgObj
                })),
            },
            { new: true }
        );

        res.status(200).json(updatedTour);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el tour", error });
    }
};

const deleteImageFromTour = async (req, res, next) => {
    const { tour_id, image_id } = req.params;
    try {
        const tour = await Tours.findById(tour_id);
        if (!tour) {
            return res.status(404).json({ message: "Tour no encontrado" });
        }

        let newImagesArray = [];
        tour.images.forEach(image => {
            if (image.imgObj != image_id) {
                newImagesArray.push(image)
            }
        })

        tour.images = [];
        tour.images = newImagesArray;

        const updatedTour = await Tours.findByIdAndUpdate(tour_id, tour, { new: true })
        res.status(200).json(updatedTour);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el tour", error });
    }
}

const deleteTour = async (req, res, next) => {
    try {
        const tour = await Tours.findByIdAndDelete(req.params.id);
        res.status(200).json(tour);
    } catch (error) {
        return (res.status(404).json(error));
    };
};

module.exports = { getTours, getTourById, createTour, updateTour, deleteImageFromTour, deleteTour };