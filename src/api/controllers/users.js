const { sendVerificationEmail, sendRecoverPasswordCode } = require("../../config/mailer");
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
    };
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'favouriteTours.tourId',
                populate: {
                    path: 'images.imgObj',
                    model: 'images'
                }
            })
            .populate({
                path: 'shoppingCart.tourId',
                populate: {
                    path: 'images.imgObj',
                    model: 'images'
                }
            })

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
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
    };
};

const register = async (req, res, next) => {
    try {
        const userEmailDuplicated = await User.findOne({ email: req.body.email });
        if (userEmailDuplicated) {
            return res.status(400).json({ message: "There is already a user with this email", userDuplicated: 'true', email: req.body.email });
        }

        const verificationToken = generateNumericToken();
        await sendVerificationEmail(req.body.email, verificationToken);

        const hashedToken = bcrypt.hashSync(verificationToken, bcrypt.genSaltSync(10));

        const newUser = new User({ ...req.body, verificationToken: hashedToken, isVerified: false, role: 'user' });
        const user = await newUser.save();

        res.status(200).json({ user, message: 'Usuario registrado. Verifica tu correo electrónico.' });
    } catch (error) {
        return res.status(404).json(error);
    };
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
    };
};

const generateNewEmailVerificationToken = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const newVerificationToken = generateNumericToken();
        await sendRecoverPasswordCode(email, newVerificationToken);

        const hashedToken = bcrypt.hashSync(newVerificationToken, bcrypt.genSaltSync(10));

        user.verificationToken = hashedToken;

        await user.save();

        res.status(200).json({ message: 'Hemos generado y enviado un nuevo código de verificación' });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar nuevo código de verificación', error });
    };
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, verificationToken, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        if (!bcrypt.compareSync(verificationToken, user.verificationToken)) {
            return res.status(400).json({ message: 'Token de verificación incorrecto' });
        }

        user.password = newPassword;
        user.verificationToken = "";

        await user.save();

        res.status(200).json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al restablecer la contraseña', error });
    }
};


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
    };
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        return (res.status(404).json(error));
    };
};


//  -----------------------------------------    CART & FAV    ------------------------------------------  //


const addTourToFavorites = async (req, res, next) => {
    try {
        const { user_id, tour_id } = req.params;
        const { destination_id } = req.body;

        let user = await User.findById(user_id);

        const isTourInFavorites = user.favouriteTours.some(favTour =>
            favTour.tourId.toString() === tour_id && favTour.destinationId.toString() === destination_id
        );

        if (!isTourInFavorites) {
            const newFavorite = { destinationId: destination_id, tourId: tour_id };
            user.favouriteTours.push(newFavorite);

            await user.save();

            user = await User.findById(user_id)
                .populate({
                    path: 'favouriteTours.tourId',
                    populate: {
                        path: 'images.imgObj',
                        model: 'images'
                    }
                });

            const addedFavorite = user.favouriteTours[user.favouriteTours.length - 1];

            return res.status(200).json({ addedFavorite });
        }

        return res.status(200).json({ message: 'Tour already in favorites', user });
    } catch (error) {
        return res.status(404).json({ message: 'Error adding tour to favorites', error });
    }
};



const removeTourFromFavorites = async (req, res, next) => {
    try {
        const { user_id, tour_id } = req.params;
        const { destination_id } = req.body;

        const user = await User.findById(user_id);

        const isTourInFavorites = user.favouriteTours.some(favTour =>
            favTour.tourId.toString() === tour_id && favTour.destinationId.toString() === destination_id
        );

        if (isTourInFavorites) {
            const removedTour = user.favouriteTours.find(favTour =>
                favTour.tourId.toString() === tour_id && favTour.destinationId.toString() === destination_id
            );

            user.favouriteTours = user.favouriteTours.filter(favTour =>
                !(favTour.tourId.toString() === tour_id && favTour.destinationId.toString() === destination_id)
            );

            await user.save();

            return res.status(200).json({ removedTour });
        }

        return res.status(404).json({ message: 'Tour not found in favorites' });

    } catch (error) {
        return res.status(500).json({ message: 'Error removing tour from favorites', error });
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
    };
};


module.exports = { getUsers, getUserById, login, updateUser, register, generateNewEmailVerificationToken, resetPassword, verifyEmail, deleteUser, addTourToCart, addTourToFavorites, removeTourFromFavorites };