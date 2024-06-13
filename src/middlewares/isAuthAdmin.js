const User = require("../api/models/users");
const { verifyKey } = require("../utils/jwt");

const isAuthAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const parsedToken = token.replace("Bearer ", "");

        const { id } = verifyKey(parsedToken);
        const user = await User.findById(id);

        user.password = null
        req.user = user;
        if (user.role == "admin") {
            console.log("Autenticación de Administrador correcta");
            next();
        }else{
            console.log("Unauthorized: admins only");
            return res.status(401).json({ message: "Unauthorized" })
        }
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }
}

module.exports = { isAuthAdmin };