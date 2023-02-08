const mongoose = require('mongoose')

const UserModel = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  isAdmin: {
    type: Boolean,
    default: false
  }},
  { timestamps: true }
);

module.exports = mongoose.model('User', UserModel)