const Articles = require("../models/articles");
const Images = require('../models/images');

const getArticles = async (req, res, next) => {
    try {
        const options = {
            projection: { _id: 0, title: 1, subtitle, images: 1 },
        };
        const articles = await Articles.find({}, options)
            .populate({
                path: 'images.imgObj',
                options: { limit: 1 },
            });

        console.log(articles)

        res.status(200).json(articles);
    } catch (error) {
        return res.status(404).json(error);
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
