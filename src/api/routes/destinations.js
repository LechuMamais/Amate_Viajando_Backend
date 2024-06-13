const { isAuth } = require("../../middlewares/isAuth");
const { isAuthAdmin } = require("../../middlewares/isAuthAdmin");
const { createDestination, getDestinationById, getDestinations, updateDestination, deleteDestination } = require("../controllers/destinations");

const destinationsRouter = require("express").Router();

destinationsRouter.get("/:id", getDestinationById);
destinationsRouter.get("/", getDestinations);
destinationsRouter.post("/",isAuthAdmin,  createDestination);
destinationsRouter.put("/:id",isAuthAdmin, updateDestination);
destinationsRouter.delete("/:id",isAuthAdmin, deleteDestination);

module.exports = destinationsRouter;