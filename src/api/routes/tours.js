const { isAuth } = require("../../middlewares/auth");
const { createTour, getTourById, getTours, updateTour, deleteTour } = require("../controllers/tours");

const toursRouter = require("express").Router();

toursRouter.get("/:id", getTourById);
toursRouter.get("/", getTours);
toursRouter.post("/",isAuth, createTour);
toursRouter.put("/:id",isAuth, updateTour);
toursRouter.delete("/:id",isAuth, deleteTour);

module.exports = toursRouter;