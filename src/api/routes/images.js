const { isAuth } = require("../../middlewares/auth");
const { upload } = require('../../middlewares/file')
const { createImage, getImageById, getImages, updateImage, deleteImage } = require("../controllers/images");

const imagesRouter = require("express").Router();

imagesRouter.get("/:id", getImageById);
imagesRouter.get("/", getImages);
imagesRouter.post("/", upload.single("url"), createImage);
imagesRouter.put("/:id",isAuth, upload.single("url"), updateImage);
imagesRouter.delete("/:id",isAuth, deleteImage);

module.exports = imagesRouter;