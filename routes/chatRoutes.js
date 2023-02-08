const express = require("express")
const router = express.Router()
const path = require("path")
const chatControllers = require(path.join(__dirname, '../controllers/chatControllers'))

router.route('/')
    .get(chatControllers.getChats)
    .post(chatControllers.accessChat)
    .delete(chatControllers.deleteChat)

module.exports = router