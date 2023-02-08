const jwt = require('jsonwebtoken');
require('dotenv').config

const generateJWT = ( _id ) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    })
}

module.exports = { generateJWT }