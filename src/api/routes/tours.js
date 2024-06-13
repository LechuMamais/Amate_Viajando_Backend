const { isAuthAdmin } = require("../../middlewares/isAuthAdmin");
const { isAuth } = require("../../middlewares/isAuth");
const { createTour, getTourById, getTours, updateTour, deleteTour } = require("../controllers/tours");

const toursRouter = require("express").Router();

toursRouter.get("/:id", getTourById);
toursRouter.get("/", getTours);
toursRouter.post("/", isAuthAdmin, createTour);
toursRouter.put("/:id", isAuthAdmin, updateTour);
toursRouter.delete("/:id", isAuthAdmin, deleteTour);

module.exports = toursRouter;