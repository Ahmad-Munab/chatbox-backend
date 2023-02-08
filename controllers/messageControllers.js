const path = require("path");
const asyncHandler = require("express-async-handler");

const User = require(path.join(__dirname, "../models/User"));
const Chat = require(path.join(__dirname, "../models/Chat"));
const Message = require(path.join(__dirname, "../models/Message"));

const getMessages = asyncHandler( async (req, res) => {
    if (!req.body.chatId) return res.status(400).json({ message: "chatId or text missing" });
    
    const messages = await Message.find({ to: req.body.chatId }).populate("from", "-password")
    if (messages.length > 0) {
        return res.status(200).json(messages)
    }
    res.status(404).json({ message: `No messages found in the chat: ${req.body.chatId}`})
})

const sendMessage = asyncHandler( async (req, res) => {
    if (!req.body.chatId) return res.status(400).json({ message: "chatId required" });

    const validChat = await Chat.findById(req.body.chatId)
    if (!validChat) return res.status(4040).json({ message: `No chat fround with with _id: ${req.body.chatId}` });

    try {
        var newMessage = await Message.create({
            text: req.body.text,
            from: req.user._id,
            to: req.body.chatId
        })
        newMessage = Message.findById(newMessage._id).populate("from", "-password")

        return res.status(201).json({ message: `New message created from ${req.user.handle} to ${validChat.name} (${req.body.chatId})`, newMessage: newMessage });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }

})



module.exports = { getMessages, sendMessage }