const path = require("path");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const User = require(path.join(__dirname, "../models/User"));
const Chat = require(path.join(__dirname, "../models/Chat"));

const  jwt = require("jsonwebtoken");
const { generateJWT } = require("../config/generateJWT");
const { generateIMG } = require("../config/generateIMG");


const getUserData = asyncHandler( async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "-password")
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    }).populate("users", "-password")
    return res.status(200).json({user, chats})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
})

const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("-password").lean()
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, handle, password } = req.body;
  if (!username || !handle || !password) {
    return res.status(400).json({
      message: "Bad request, All fields required",
    });
  } else if (handle[0] !== "@") {
    res
      .status(401)
      .json({
        message: `Not a valid handle: ${handle}. First letter must be "@"`,
      });
  }

  const duplicate = await User.findOne({
    handle: { $regex: new RegExp(handle, "i") },
  }).exec();
  if (duplicate) {
    return res.status(400).json({
      message: `Name: ${duplicate.username} already exists`,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    handle: handle.toLowerCase(),
    password: hashedPassword,
    profilePic: req.body.profilePic,
    isAdmin: false,
  });
  await user.save();

  if (user) {
    let jwt = generateJWT(user._id);
    res
      .cookie("jwt", jwt, {
        expires: new Date(Date.now() + 86400000 * 5), // {1day} * 5
      })
      .status(201)
      .json({ message: `New user ${user.username} created`, user, jwt });
  } else {
    res.status(500).json({ message: "Failed to create user" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { handle, password } = req.body;
  if (!handle || !password) {
    return res.status(400).json({
      message: "Bad request, All fields required",
    });
  }

  const user = await User.findOne({
    handle: { $regex: new RegExp(handle, "i") },
  });
  if (user && (await bcrypt.compare(password, user.password))) {
    let jwt = generateJWT(user._id);
    res
      .cookie("jwt", jwt, {
        expires: new Date(Date.now() + 86400000 * 5), // {1day} * 5
      })
      .status(200)
      .json({
        user,
        message: "User logged in successfully",
        jwt,
      });
  } else {
    res.status(401).json({ message: "Invalid Userame or Password" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = req.user;
  let { username, password, profilePic } = req.body;

  user.username = username || user.username;
  user.password = password ? bcrypt.hash(password, 10 ) : user.password;
  user.profilePic = profilePic || user.profilePic;

  const updatedUser = await user.save();

  res
    .status(200)
    .json({ message: "User updated successfully", updatedUser });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { usersId } = req.body;
  if (!usersId || !usersId[0]) {
    return res.status(400).json({ message: "Bad request, usersId required." });
  }

  usersId.forEach(async (_id) => {
    const user = await User.findByIdAndDelete(_id).lean();
    if (!user) {
      return res
        .status(404)
        .json({ message: `User with _id: ${_id} not found` });
    }
  });

  res.status(200).json({ message: "Users deleted successfully" });
});

module.exports = {
  getUsers,
  getUserData,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
};
