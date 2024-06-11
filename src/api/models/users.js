const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user", required: true },
    favouriteTours:
        [{ type: mongoose.Types.ObjectId, required: true, default: {}, ref: "tours" }],
    shoppingCart:
        [{ type: mongoose.Types.ObjectId, required: true, default: {}, ref: "tours" }]
}, {
    timestamps: true,
    collectionName: "users"
});

userSchema.pre("save", function () {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10))
});

const User = mongoose.model("users", userSchema, "users");

module.exports = User;