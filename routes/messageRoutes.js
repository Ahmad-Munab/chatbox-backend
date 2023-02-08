const express = require("express")
const router = express.Router()
const path = require("path")
const messageControllers = require(path.join(__dirname, '../controllers/messageControllers'))

router.route('/')
    .get(messageControllers.getMessages)
    .post(messageControllers.sendMessage)

module.exports = router