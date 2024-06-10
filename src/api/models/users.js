const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["admin", "organizer", "user"], default: "user", required: true},
    eventsAsAttendee: [
        {type: mongoose.Types.ObjectId, required: false, ref: "events"}
    ],
    eventsAsOrganizer: [
        {type: mongoose.Types.ObjectId, required: false, ref: "events"}
    ]
},{
    timestamps: true,
    collectionName: "users"
});

userSchema.pre("save", function () {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10))
});

const User = mongoose.model("users", userSchema, "users");

module.exports = User;