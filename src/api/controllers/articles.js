const Articles = require("../models/articles");
const Images = require('../models/images');

const getArticles = async (req, res, next) => {
    try {
        // Consulta con proyección directa
        const articles = await Articles.find({}, {
            _id: 1, // Incluir _id
            title: 1, // Incluir title
            subtitle: 1, // Incluir subtitle
            'images.imgObj': 1, // Incluir el array images.imgObj
        }).populate({
            path: 'images.imgObj', // Poblamos el campo imgObj
            options: { limit: 1 }, // Solo queremos el primer objeto del array
        });

        console.log(JSON.stringify(articles, null, 2));

        // Transformar resultados para incluir solo el primer objeto de imgObj
        const transformedArticles = articles.map(article => ({
            _id: article._id,
            title: article.title,
            subtitle: article.subtitle,
            imgObj: article.images.imgObj[0] || null, // Incluimos solo el primer objeto, o null si no hay datos
        }));

        // Enviar respuesta al cliente
        res.status(200).json(transformedArticles);
    } catch (error) {
        console.error('Error al obtener los artículos:', error);
        res.status(404).json({ message: 'No se pudieron obtener los artículos', error });
    }
};


const getArticleById = async (req, res, next) => {
    try {
        const article = await Articles.findById(req.params.id)
            .populate('images.imgObj')

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.status(200).json(article);
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: error.message });
    }
};

const createArticle = async (req, res) => {
    try {
        const { title, subtitle, content, images } = req.body;

        const imageRefs = await Promise.all(images?.map(async (img) => {
            const imgDoc = await Images.findById(img.imgObj);
            if (!imgDoc) {
                throw new Error(`Image with id ${img.imgObj} and order ${img.order} not found`);
            }
            return { order: img.order, imgObj: imgDoc._id };
        }));

        const newArticle = new Articles({
            title,
            subtitle,
            content,
            images: imageRefs,
        });

        await newArticle.save();

        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateArticle = async (req, res, next) => {
    try {
        const article = await Articles.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(article);
    } catch (error) {
        return res.status(404).json(error);
    }
};


const deleteImageFromArticle = async (req, res, next) => {
    const { article_id, image_id } = req.params;
    try {
        const article = await Articles.findById(article_id);
        if (!article) {
            return res.status(404).json({ message: "Article no encontrado" });
        }

        let newImagesArray = [];
        article.images.forEach(image => {
            if (image.imgObj != image_id) {
                newImagesArray.push(image)
            }
        })

        article.images = [];
        article.images = newImagesArray;

        const updatedArticle = await Articles.findByIdAndUpdate(article_id, article, { new: true })
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el Article", error });
    }
}


const deleteArticle = async (req, res, next) => {
    try {
        const article = await Articles.findByIdAndDelete(req.params.id);
        res.status(200).json(article);
    } catch (error) {
        return res.status(404).json(error);
    }
};


module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteImageFromArticle, deleteArticle };
