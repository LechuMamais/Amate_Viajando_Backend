const { languages } = require("../../resources/languages");
const checkAllFieldsAreComplete = require("../../utils/checkAllFieldsAreComplete");
const { translateAllEmptyFields } = require("../../utils/translateAllEmptyFields");
const Articles = require("../models/articles");
const Images = require('../models/images');

const getArticles = async (req, res) => {
    try {
        const { lang } = req.params;

        if (!languages.includes(lang)) {
            if (lang === 'all') {
                const articles = await Articles.find();
                return res.status(200).json(articles);
            }
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }

        const articles = await Articles.find().populate('images.imgObj');

        const transformedArticles = articles.map(article => {
            const sortedImages = article.images.sort((a, b) => a.order - b.order);

            return {
                _id: article._id,
                title: article[lang].title,
                subtitle: article[lang].subtitle,
                images: sortedImages.length > 0 ? [sortedImages[0]] : [],
            };
        });

        res.status(200).json(transformedArticles);
    } catch (error) {
        console.error('Error al obtener los artículos:', error);
        res.status(404).json({ message: 'No se pudieron obtener los artículos', error });
    }
};

const getArticleById = async (req, res) => {
    try {
        const { lang } = req.params;

        if (!lang == 'all' && !languages.includes(lang)) {
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }
        const article = await Articles.findById(req.params.id)
            .populate('images.imgObj')

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (lang == 'all') {
            res.status(200).json(article);
        } else {
            res.status(200).json({
                _id: article._id,
                images: article.images,
                ...article[lang]
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: error.message });
    }
};

const createArticle = async (req, res) => {
    try {
        // Obtener dinámicamente los idiomas desde req.body
        const articleData = {};
        languages.forEach(lang => {
            articleData[lang] = req.body[lang] || {};
        });

        // Validar que al menos un idioma tenga campos completos
        const hasCompleteField = checkAllFieldsAreComplete(
            ...Object.values(articleData)
        );

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        // Traducir los campos vacíos
        await translateAllEmptyFields(articleData, ["title", "subtitle", "content"]);

        // Validar imágenes
        const imageRefs = await Promise.all(req.body.images?.map(async (img) => {
            const imgDoc = await Images.findById(img.imgObj);
            if (!imgDoc) {
                throw new Error(`Imagen con ID ${img.imgObj} y orden ${img.order} no encontrada`);
            }
            return { order: img.order, imgObj: imgDoc._id };
        }) || []);

        // Crear el artículo
        const newArticle = new Articles({
            ...articleData,
            images: imageRefs,
        });

        await newArticle.save();

        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateArticle = async (req, res) => {
    try {
        const article = await Articles.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Artículo no encontrado." });
        }

        const articleData = {};
        languages.forEach(lang => {
            articleData[lang] = req.body[lang] || {};
        });

        const hasCompleteField = checkAllFieldsAreComplete(...Object.values(articleData));

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        const updatedBody = await translateAllEmptyFields(articleData, ["title", "subtitle", "content"]);

        const updatedArticle = await Articles.findByIdAndUpdate(
            req.params.id,
            {
                ...updatedBody,
                images: req.body.images.map(img => ({
                    order: img.order,
                    imgObj: img.imgObj
                }))
            },
            { new: true },
        );

        res.status(200).json(updatedArticle);
    } catch (error) {
        return res.status(404).json(error);
    }
};

const deleteImageFromArticle = async (req, res) => {
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

const deleteArticle = async (req, res) => {
    try {
        const article = await Articles.findByIdAndDelete(req.params.id);
        res.status(200).json(article);
    } catch (error) {
        return res.status(404).json(error);
    }
};

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteImageFromArticle, deleteArticle };
