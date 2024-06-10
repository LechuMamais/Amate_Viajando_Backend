const jwt = require('jsonwebtoken');

const generateKey = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: 86400 // que sonn 24 horas
    });
}

const verifyKey = (token)=>{
    return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { generateKey, verifyKey};