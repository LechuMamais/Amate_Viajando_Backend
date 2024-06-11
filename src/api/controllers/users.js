const { generateKey } = require("../../utils/jwt");
const User = require("../models/users");
const bcrypt = require('bcrypt');


//  --------------------------------------------    CRUD    --------------------------------------------  //

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().populate("eventsAsOrganizer").populate("eventsAsAttendee");
        // Con POPULATE lo que hacemos es que al devolver los usuarios, también arroje toda la información de los eventos AsAttendee y AsOrganizer
        res.status(200).json(users);
    } catch (error) {
        return (res.status(404).json(error));
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate("eventsAsAttendee").populate("eventsAsOrganizer");
        res.status(200).json(user);
    } catch (error) {
        return (res.status(404).json(error));
    }
};

const register = async (req, res, next) => {
    try {
        const newUser = new User(req.body);
        const userDuplicated = await User.findOne({ userName: req.body.userName });
        if (userDuplicated) {
            return res.status(400).json({ message: "User already exists" });
        }
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


//  ----------------------------------------    MANEJAR ASISTENCIA    ----------------------------------------  //

// Controlador para inscribir un usuario a un evento
const addAssistantToUserEventsAsAttendee = async (req, res, next) =>{
    try {
        const { userId, eventId } = req.params;
        const assistant = await User.findByIdAndUpdate(userId, { $push: { eventsAsAttendee: eventId } });
        return res.status(200).json(assistant);
    } catch (error) {
        return (res.status(404).json(error));
    }
}

// Controlador para cancelar asistencia a un evento
const removeAssistantToUserEventsAsAttendee = async (req, res, next) =>{
    try {
        const { userId, eventId } = req.params;
        const assistant = await User.findByIdAndUpdate(userId, { $pull: { eventsAsAttendee: eventId } });
        return res.status(200).json(assistant);
    } catch (error) {
        return (res.status(404).json(error));
    }
}

module.exports = { getUsers, getUserById, updateUser, register, deleteUser, login, addAssistantToUserEventsAsAttendee, removeAssistantToUserEventsAsAttendee };