const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false, required: true },
  verificationToken: { type: String, required: false },
  role: { type: String, enum: ["admin", "user"], default: "user", required: true },
  favouriteTours: [{ type: mongoose.Types.ObjectId, ref: "tours" }],
  shoppingCart: [{ type: mongoose.Types.ObjectId, ref: "tours" }]
}, {
  timestamps: true,
  collection: "users"
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
