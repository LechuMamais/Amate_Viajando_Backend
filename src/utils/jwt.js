const jwt = require('jsonwebtoken');

const generateKey = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: 31536000
    });
}

const verifyKey = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { generateKey, verifyKey };