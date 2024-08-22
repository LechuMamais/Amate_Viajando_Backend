const { isAuth } = require("../../middlewares/isAuth");

const { getUsers, getUserById, register, login, updateUser, deleteUser, addTourToCart, addTourToFavorites, verifyEmail, generateNewEmailVerificationToken, resetPassword } = require("../controllers/users");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);
usersRouter.get("/:id", getUserById);
usersRouter.post("/register", register);
usersRouter.post("/verify-email", verifyEmail);
usersRouter.post("/generateNewVerificationToken", generateNewEmailVerificationToken);
usersRouter.post("/reset-password", resetPassword);
usersRouter.post("/login", login);
usersRouter.put("/:id", [isAuth], updateUser);
usersRouter.delete("/:id", [isAuth], deleteUser);
usersRouter.get("/checkLogged/:id", [isAuth], getUserById); // Esta ruta utiliza el mismo controller que getUserById, pero pasando por isAuth.
// Si enviandole el id por params y el Bearer Token del localStorage por las headers devuelve el usuario, entonces está logueado correctamente

usersRouter.put("/addTourToCart/:user_id/:tour_id", [isAuth], addTourToCart)
usersRouter.put("/addTourToFavorites/:user_id/:tour_id", [isAuth], addTourToFavorites)

module.exports = usersRouter;