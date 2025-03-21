const { deleteFile } = require("../../utils/deleteFile");
const Images = require("../models/images");

const getImages = async (req, res, next) => {
  try {
    const images = await Images.find();
    res.status(200).json(images)
  } catch (error) {
    return (res.status(404).json(error));
  };
};

const getImageById = async (req, res, next) => {
  try {
    const image = await Images.findById(req.params.id);
    res.status(200).json(image);
  } catch (error) {
    return (res.status(404).json(error));
  };
};

const createImage = async (req, res, next) => {
  try {
    const imageData = {
      name: req.body.name,
      url: req.file.path,
      alt: req.body.alt,
      description: req.body.description
    };

    const image = new Images(imageData);

    const imageDB = await image.save();
    res.status(201).json({ message: "Imagen creada", element: imageDB });
  } catch (error) {
    return next(error);
  }
};


const updateImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imageData = {
      name: req.body.name,
      alt: req.body.alt,
      description: req.body.description
    };

    const existingImage = await Images.findById(id);
    if (!existingImage) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    if (req.file) {
      await deleteFile(existingImage.url);
      imageData.url = req.file.path;
    }

    const updatedImage = await Images.findByIdAndUpdate(id, imageData, { new: true });
    if (!updatedImage) {
      return res.status(404).json({ message: "No se pudo actualizar la imagen" });
    }

    res.status(200).json({ message: "Imagen actualizada", element: updatedImage });
  } catch (error) {
    console.error("Error actualizando la imagen:", error);
    return res.status(500).json({ message: "Error actualizando la imagen", error });
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const image = await Images.findByIdAndDelete(req.params.id);
    await deleteFile(image.url);
    res.status(200).json({ message: "Imagen eliminada", element: image });
  } catch (error) {
    return (res.status(404).json(error));
  };
};

module.exports = { getImages, getImageById, createImage, updateImage, deleteImage };