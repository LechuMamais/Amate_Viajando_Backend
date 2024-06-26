const { generateKey } = require("../../utils/jwt");
const User = require("../models/users");
const bcrypt = require('bcrypt');


//  --------------------------------------------    CRUD    --------------------------------------------  //

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        return (res.status(404).json(error));
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        res.status(200).json(user);
    } catch (error) {
        return (res.status(404).json(error));
    }
};

const register = async (req, res, next) => {
    try {
        console.log(req.body)
        const newUser = new User(req.body);

        const userEmailDuplicated = await User.findOne({ email: req.body.email });
        if (userEmailDuplicated) {
            return res.status(400).json({ message: "There is already a user with this email", userDuplicated: 'true', email: req.body.email });
        }

        newUser.role = "user";
        const user = await newUser.save();
        res.status(201).json(user);
    } catch (error) {
        return (res.status(404).json(error));
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ message: "Wrong password" });
        }
        const token = generateKey(user._id);
        res.status(200).json({ token, user });
    } catch (error) {
        return (res.status(404).json(error));
    }
}

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.id.toString() !== id) {
            return res.status(400).json("No puedes modificar un usuario que no seas tu mismo");
        }
        const newUser = new User(req.body);
        newUser._id = id;
        const oldUser = await User.findById(id);
        newUser.favouriteTours = [...oldUser.favouriteTours, newUser.favouriteTours];
        newUser.shoppingCart = [...oldUser.shoppingCart, newUser.shoppingCart];
        const userUpdated = await User.findByIdAndUpdate(id, newUser, { new: true });

        return res.status(200).json(userUpdated);

    } catch (error) {
        console.log(error);
        return (res.status(404).json(error));
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        return (res.status(404).json(error));
    }
};

const addTourToCart = async (req, res, next) => {
    try {
        const { user_id, tour_id } = req.params;
        const user = await User.findById(user_id);
        user.shoppingCart = [...user.shoppingCart, tour_id];
        const userUpdated = await User.findByIdAndUpdate(user_id, user, { new: true });
        return res.status(200).json(userUpdated);

    } catch (error) {
        return (res.status(404).json(error));
    }
}

const addTourToFavorites = async (req, res, next) => {
    try {
        const { user_id, tour_id } = req.params;
        const user = await User.findById(user_id);
        user.favouriteTours = [...user.favouriteTours, tour_id];
        const userUpdated = await User.findByIdAndUpdate(user_id, user, { new: true });
        return res.status(200).json(userUpdated);

    } catch (error) {
        return (res.status(404).json(error));
    }
}


module.exports = { getUsers, getUserById, updateUser, register, deleteUser, login, addTourToCart, addTourToFavorites };