const { default: mongoose } = require("mongoose");
const { languages } = require("../../resources/languages");

const languageFields = {
    title: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String, required: true },
};

const languageSchema = languages.reduce((acc, lang) => {
    acc[lang] = languageFields;
    return acc;
}, {});

const articlesSchema = new mongoose.Schema({
    ...languageSchema,
    images: [
        {
            order: { type: Number, required: true },
            imgObj: { type: mongoose.Types.ObjectId, required: true, ref: "images" }
        }
    ]
}, {
    timestamps: true,
    collectionName: "articles"
});

const Articles = mongoose.model("articles", articlesSchema, "articles");

module.exports = Articles;
