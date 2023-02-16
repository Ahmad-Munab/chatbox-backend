const asyncHandler = require("express-async-handler");
const path = require("path");
const User = require(path.join(__dirname, "../models/User"));
const Chat = require(path.join(__dirname, "../models/Chat"));
const Message = require(path.join(__dirname, "../models/Message"));

const mongoose = require("mongoose");

const getFriends = asyncHandler(async (req, res) => {
  try {
    const { friends } = await User.findById(req.user._id).populate("friends", "-password");
    res.status(200).json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const updateFriends = asyncHandler(async (req, res) => {
  let friendId = req.body.friendId;
  if (!friendId) return res.status(400).json({ message: "friendId needed" });

  const friend = await User.findById(friendId);
  if (!friend)
    return res.status(404).json({ message: "No user with friendId found" });
  friendId = friend._id;

  // this isnt working, fixing later
  // if (mongoose.Types.ObjectId(friendId) === mongoose.Types.ObjectId(req.user._id)) {
  //   return res.status(400).json({ message: "You can't add yourself as a friend :/" })
  // }

  const isAlreadyFriends = req.user.friends.includes(
    mongoose.Types.ObjectId(friendId)
  );
  if (isAlreadyFriends) {
    return res.status(400).json({ message: `Already friends with ${friend.username} (${friend.handle})` });
  }

  try {
    // updating the current users friendlist
    req.user.friends = [...req.user.friends, friendId];
    await req.user.save();

    // updating the friends friendlist
    friend.friends = [...friend.friends, req.user._id];
    await friend.save();

    let newChat = await Chat.create({
      name: `${req.user.handle} ${friend.handle}`,
      users: [req.user._id, friendId],
      admin: req.user._id,
    });
    newChat = await Chat.findById(newChat._id)
      .populate("users", "-password")
      .populate("admin", "-password");

    res.status(200).json({ message: "Friend added", updatedUser: req.user, newFriend: friend, newChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const deleteFriend = asyncHandler(async (req, res) => {
  let friendId = req.body.friendId;
  if (!friendId) return res.status(400).json({ message: "friendId needed" });

  const friend = await User.findById(friendId);
  if (!friend)
    return res.status(404).json({ message: "No user with friendId found" });
  friendId = friend._id;

  try {
    // deleting the friend from this users friendlist
    req.user.friends = req.user.friends.filter(
      (friend) => !friend.equals(friendId)
    );
    await req.user.save();

    // deleting this user from the friends friendlist
    friend.friends = friend.friends.filter(
      (friend) => !friend.equals(req.user._id)
    );
    await friend.save();

    const chat = await Chat.findOne({
      users: { $elemMatch: { $eq: mongoose.Types.ObjectId(req.user._id) } },
      isGroupChat: false,
    });
    await Chat.findByIdAndDelete(chat._id);

    const deletedMessages = await Message.deleteMany({ to: chat._id });

    res.status(200).json({ message: "Friend deleted", deletedFriendId: friend._id, deletedChatId: chat._id, deletedMessages});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = { getFriends, updateFriends, deleteFriend };
