const { isAuth } = require("../../middlewares/auth");
const { createDestination, getDestinationById, getDestinations, updateDestination, deleteDestination } = require("../controllers/destinations");

const destinationsRouter = require("express").Router();

destinationsRouter.get("/:id", getDestinationById);
destinationsRouter.get("/", getDestinations);
destinationsRouter.post("/", createDestination);
destinationsRouter.put("/:id",isAuth, updateDestination);
destinationsRouter.delete("/:id",isAuth, deleteDestination);

module.exports = destinationsRouter;