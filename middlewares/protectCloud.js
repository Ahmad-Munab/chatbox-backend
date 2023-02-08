const  asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

const CLOUDINARY_CLOUD_NAME=process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY=process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET=process.env.CLOUDINARY_API_SECRET

const protectCloud = asyncHandler(async (req, res, next) => {
    const expectedSignature = cloudinary.utils.api_sign_request({ public_id: req.body.public_id, version: req.body.version }, CLOUDINARY_API_SECRET )
    if (expectedSignature === req.body.signature) {
        req.body.profilePic = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_1000,q_100,c_fill,ar_1:1/${req.body.public_id}.jpg`
        next()
    } else if (!req.body.public_id) {
        next()
    } else {
        return res.status(401).json({ message: "cloud public_id not acceptable" })
    }
});

module.exports = protectCloud;