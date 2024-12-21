//const { isAuth } = require("../../middlewares/isAuth");
const { isAuthAdmin } = require("../../middlewares/isAuthAdmin");
const { createDestination, getDestinationById, getDestinations, updateDestination, deleteDestination, deleteImageFromDestination } = require("../controllers/destinations");

const destinationsRouter = require("express").Router();

destinationsRouter.get("/:id/:lang", getDestinationById);
destinationsRouter.get("/:lang", getDestinations);
destinationsRouter.post("/", isAuthAdmin, createDestination);

destinationsRouter.put("/:destination_id/deleteImage/:image_id", isAuthAdmin, deleteImageFromDestination);

destinationsRouter.put("/:id", isAuthAdmin, updateDestination);
destinationsRouter.delete("/:id", isAuthAdmin, deleteDestination);

module.exports = destinationsRouter;