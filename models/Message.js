const mongoose = require('mongoose')

const MessageModel = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    }},
    { timestamps: true }
) 

module.exports = mongoose.model('Message', MessageModel)