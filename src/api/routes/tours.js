const { isAuthAdmin } = require("../../middlewares/isAuthAdmin");
const { isAuth } = require("../../middlewares/isAuth");
const { createTour, getTourById, getTours, updateTour, deleteTour, deleteImageFromTour } = require("../controllers/tours");

const toursRouter = require("express").Router();

toursRouter.get("/:id/:lang", getTourById);
toursRouter.get("/:lang", getTours);
toursRouter.post("/", isAuthAdmin, createTour);

toursRouter.put("/:tour_id/deleteImage/:image_id", isAuthAdmin, deleteImageFromTour);

toursRouter.put("/:id", isAuthAdmin, updateTour);
toursRouter.delete("/:id", isAuthAdmin, deleteTour);

module.exports = toursRouter;