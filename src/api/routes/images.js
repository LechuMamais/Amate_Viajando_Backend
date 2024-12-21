const { upload } = require('../../middlewares/file')
const { createImage, getImageById, getImages, updateImage, deleteImage } = require("../controllers/images");
const { isAuthAdmin } = require("../../middlewares/isAuthAdmin");

const imagesRouter = require("express").Router();

imagesRouter.get("/:id", getImageById);
imagesRouter.get("/", getImages);
imagesRouter.post("/", isAuthAdmin, upload.single("url"), createImage);
imagesRouter.put("/:id", isAuthAdmin, upload.single("url"), updateImage);
imagesRouter.delete("/:id", isAuthAdmin, deleteImage);

module.exports = imagesRouter;