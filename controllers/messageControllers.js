const path = require("path");
const asyncHandler = require("express-async-handler");

const User = require(path.join(__dirname, "../models/User"));
const Chat = require(path.join(__dirname, "../models/Chat"));
const Message = require(path.join(__dirname, "../models/Message"));

const getMessages = asyncHandler(async (req, res) => {
  if (!req.query.chatId)
    return res.status(400).json({ message: "chatId missing" });

  try {
    const messages = await Message.find({ to: req.query.chatId }).populate(
      "from",
      "-password"
    );
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  if (!req.body.chatId)
    return res.status(400).json({ message: "chatId required" });

  const validChat = await Chat.findById(req.body.chatId);
  if (!validChat)
    return res
      .status(4040)
      .json({ message: `No chat fround with with _id: ${req.body.chatId}` });

  try {
    var newMessage = await Message.create({
      text: req.body.text,
      from: req.user._id,
      to: req.body.chatId,
    });

    newMessage = await Message.findById(newMessage._id)
      .populate("from", "-password")
      .exec();

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = { getMessages, sendMessage };
