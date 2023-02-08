const mongoose = require('mongoose')

const ChatModel = mongoose.Schema({
    isGroupChat: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
    }}, 
    { timestamps: true }
) 

module.exports = mongoose.model('Chat', ChatModel)