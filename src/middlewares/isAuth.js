const User = require("../api/models/users");
const { verifyKey } = require("../utils/jwt");

const isAuth = async (req,res, next) =>{
    try {
        const token = req.headers.authorization;
        const parsedToken = token.replace("Bearer ", "");

        const {id} = verifyKey(parsedToken);
        const user = await User.findById(id);

        user.password = null
        req.user = user;

        console.log("Autenticación correcta");
        next();
    } catch (error) {
        return res.status(401).json({message: "Unauthorized"})
    }
}

module.exports = { isAuth };