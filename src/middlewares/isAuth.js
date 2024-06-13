const User = require("../api/models/users");
const { verifyKey } = require("../utils/jwt");

const isAuth = async (req,res, next) =>{
    try {
        const token = req.headers.authorization;
        const parsedToken = token.replace("Bearer ", "");

        const {id} = verifyKey(parsedToken);
        const user = await User.findById(id);
        

        //Antes de abrir la puerta, la modificamos a la req algunas cositas
        /*req.password = null;    // Le borramos las password para que no se vea
        req.userName = user.userName;    // le pasamos el userName que corresponde con el id
        req.id = user._id;    // le pasamos el id que corresponde con el id*/
        req.user = user;
        user.password = null

        console.log("Autenticación correcta");
        next();
    } catch (error) {
        return res.status(401).json({message: "Unauthorized"})
    }
}

module.exports = { isAuth };