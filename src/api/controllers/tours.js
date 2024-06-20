const Tours = require("../models/tours");

const getTours = async (req, res, next) => {
    try {
        const tours = await Tours.find().populate('images.imgObj');

        res.status(200).json(tours)
    } catch (error) {
        return (res.status(404).json(error));
    };
};

const getTourById = async (req, res, next) => {
    try {
        const tour = await Tours.findById(req.params.id).populate('images.imgObj');

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

const updateTour = async (req, res) => {
    const { name, heading, description, longDescription, images } = req.body;

    try {
        const updatedTour = await Tours.findByIdAndUpdate(
            req.params.id,
            {
                name,
                heading,
                description,
                longDescription,
                images: images.map(img => ({
                    order: img.order,
                    imgObj: img.imgObj
                })),
            },
            { new: true }
        );

        if (!updatedTour) {
            return res.status(404).json({ message: "Tour no encontrado" });
        }

        res.status(200).json(updatedTour);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el tour", error });
    }
};

const deleteImageFromTour = async (req, res, next) => {
    const {tour_id, image_id} = req.params;
    try {
        const tour = await Tours.findById(tour_id);
        if (!tour) {
            return res.status(404).json({ message: "Tour no encontrado" });
        }

        let newImagesArray = [];
        tour.images.forEach(image=>{
            if(image.imgObj != image_id){
                newImagesArray.push(image)
            }
        })

        tour.images = [];
        tour.images = newImagesArray;

        const updatedTour = await Tours.findByIdAndUpdate(tour_id, tour, {new: true})
        res.status(200).json(updatedTour);
    } catch(error){
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