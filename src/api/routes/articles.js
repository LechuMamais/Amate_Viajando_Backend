const { isAuthAdmin } = require("../../middlewares/isAuthAdmin");
const { createArticle, getArticleById, getArticles, updateArticle, deleteArticle, deleteImageFromArticle } = require("../controllers/articles");

const articlesRouter = require("express").Router();

articlesRouter.get("/:id", getArticleById);
articlesRouter.get("/", getArticles);
articlesRouter.post("/", isAuthAdmin, createArticle);

articlesRouter.put("/:article_id/deleteImage/:image_id", isAuthAdmin, deleteImageFromArticle);

articlesRouter.put("/:id", isAuthAdmin, updateArticle);
articlesRouter.delete("/:id", isAuthAdmin, deleteArticle);

module.exports = articlesRouter;