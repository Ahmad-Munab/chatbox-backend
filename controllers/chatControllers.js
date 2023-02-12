const path = require("path");
const asyncHandler = require("express-async-handler");

const User = require(path.join(__dirname, "../models/User"));
const Chat = require(path.join(__dirname, "../models/Chat"));
const Message = require(path.join(__dirname, "../models/Message"));

const getChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("admin", "-password")
      
    return res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
});

const accessChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("admin", "-password")

  if (chat.length === 0) {
    try {
      let newChat = await Chat.create({
        name: "Default single chat name",
        users: [req.user._id, userId],
        admin: req.user._id,
      });
      newChat = await Chat.findById(newChat._id)
        .populate("users", "-password")
        .populate("admin", "-password");

      return res.status(201).json({
        message: `New chat created between ${newChat.users[0].username} and ${newChat.users[1].username}`,
        newChat,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.status(200).json(chat[0]);
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res.status(400).json({ message: "Bad request, chatId required." });
  }

  const chat = await Chat.findByIdAndDelete(chatId).lean();
  if (!chat) {
    return res.status(404).json({ message: `chatId: ${chatId} not found` });
  }

  res.status(200).json({ message: "Chat deleted successfully" });
});

module.exports = { getChats, accessChat, deleteChat };
