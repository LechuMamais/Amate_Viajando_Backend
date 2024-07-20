const sendVerificationEmail = require("../../config/mailer");
const generateNumericToken = require("../../utils/generateNumericToken");
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
        const userEmailDuplicated = await User.findOne({ email: req.body.email });
        if (userEmailDuplicated) {
            return res.status(400).json({ message: "There is already a user with this email", userDuplicated: 'true', email: req.body.email });
        }

        const verificationToken = generateNumericToken();
        const hashedToken = bcrypt.hashSync(verificationToken, bcrypt.genSaltSync(10));

        const newUser = new User({ ...req.body, verificationToken: hashedToken, isVerified: false, role: 'user' });
        const user = await newUser.save();

        await sendVerificationEmail(req.body.email, verificationToken);

        res.status(200).json({ user, message: 'Usuario registrado. Verifica tu correo electrónico.' });
    } catch (error) {
        return res.status(404).json(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        if (!bcrypt.compareSync(req.body.verificationToken, user.verificationToken)) {
            console.log("token de verificación incorrecto")
            return res.status(400).json({ message: 'Token de verificación incorrecto' });
        }

        user.isVerified = true;
        user.verificationToken = "";
        await user.save();

        res.status(200).json({ message: 'Correo electrónico verificado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el correo electrónico', error });
    }
};

const generateNewEmailVerificationToken = async (req, res, next)=>{
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        if (user.isVerified){
            return res.status(400).json({ message: 'Email de usuario ya verificado' });
        }

        const newVerificationToken = generateNumericToken();
        const hashedToken = bcrypt.hashSync(newVerificationToken, bcrypt.genSaltSync(10));

        user.verificationToken = hashedToken;
        await user.save();

        await sendVerificationEmail(user.email, newVerificationToken);

        res.status(200).json({ message: 'Hemos generado y enviado un nuevo código de verificación' });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar nuevo código de verificación', error });
    }
}

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


module.exports = { getUsers, getUserById, updateUser, register, generateNewEmailVerificationToken, verifyEmail, deleteUser, login, addTourToCart, addTourToFavorites };