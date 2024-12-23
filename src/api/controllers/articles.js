const languages = require("../../resources/languages");
const checkAllFieldsAreComplete = require("../../utils/checkAllFieldsAreComplete");
const { translateAllEmptyFields } = require("../../utils/translateAllEmptyFields");
const Articles = require("../models/articles");
const Images = require('../models/images');

const getArticles = async (req, res, next) => {
    try {
        const { lang } = req.params;
        console.log('idioma de la petición', lang);
        console.log('Languajes available:', languages);
        console.log('PATO cuack')

        if (!languages.includes(lang)) {
            console.log('Idioma no válido');
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }
        console.log('Idioma válido perra');

        const articles = await Articles.find().populate('images.imgObj');
        console.log('articles', articles);

        // Transformamos los artículos
        const transformedArticles = articles.map(article => {
            // Ordenamos las imágenes por el valor de `order`
            const sortedImages = article.images.sort((a, b) => a.order - b.order);

            // Retornamos solo la imagen con el menor `order` o null si no hay imágenes, y los textos en el idioma solicitado
            return {
                _id: article._id,
                title: article[lang].title,
                subtitle: article[lang].subtitle,
                images: sortedImages.length > 0 ? [sortedImages[0]] : [],
            };
        });

        console.log('Articles returned OK')

        res.status(200).json(transformedArticles);
    } catch (error) {
        console.error('Error al obtener los artículos:', error);
        res.status(404).json({ message: 'No se pudieron obtener los artículos', error });
    }
};

const getArticleById = async (req, res, next) => {
    try {
        const { lang } = req.params;

        if (!languages.includes(lang)) {
            return res.status(400).json({ message: `Idioma no válido. Los idiomas permitidos son: ${languages.join(", ")}` });
        }
        const article = await Articles.findById(req.params.id)
            .populate('images.imgObj')

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const result = {
            _id: article._id,
            images: article.images,
            ...article[lang]
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: error.message });
    }
};

const createArticle = async (req, res) => {
    try {
        const { eng, esp, ita, por, images } = req.body;

        const hasCompleteField = checkAllFieldsAreComplete(eng, esp, ita, por);

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        console.log('Traduciendo campos vacíos');
        await translateAllEmptyFields({ eng, esp, ita, por }, fields = ["title", "subtitle", "content"]);

        const imageRefs = await Promise.all(images?.map(async (img) => {
            const imgDoc = await Images.findById(img.imgObj);
            if (!imgDoc) {
                throw new Error(`Image with id ${img.imgObj} and order ${img.order} not found`);
            }
            return { order: img.order, imgObj: imgDoc._id };
        }));

        const newArticle = new Articles({
            eng,
            esp,
            ita,
            por,
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
        const article = await Articles.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Destino no encontrado." });
        }

        const { eng, esp, ita, por } = req.body;

        const hasCompleteField = checkAllFieldsAreComplete(eng, esp, ita, por);

        if (!hasCompleteField) {
            return res.status(400).json({
                message: "Debe existir al menos un campo completo en algún idioma."
            });
        }

        console.log('Traduciendo campos vacíos');
        const updatedBody = await translateAllEmptyFields({ eng, esp, ita, por }, fields = ["title", "subtitle", "content"]);
        console.log('updatedBody', updatedBody);

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
