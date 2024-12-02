import { default as mongoose } from "mongoose";

const articlesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String, required: true },
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