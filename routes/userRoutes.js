const express = require("express")
const router = express.Router()
const path = require("path")
const protect = require("../middlewares/authUser")
const protectCloud = require("../middlewares/protectCloud")
const userControllers = require(path.join(__dirname, '../controllers/userControllers'))
const friendsControllers = require(path.join(__dirname, '../controllers/friendsControllers'))


router.route('/')
    .get(protect, userControllers.getUsers)
    .patch(protect , userControllers.updateUser)
    .put(protect, userControllers.updateUser)
    .delete(protect, userControllers.deleteUser)
router.get('/data', protect, userControllers.getUserData)
router.post('/register',protectCloud, userControllers.registerUser)
router.post('/login', userControllers.loginUser)
// router.post('/uploadImg', upload.single('image'), userControllers.uploadImg);

router.route('/friends')
    .get(protect, friendsControllers.getFriends)
    .patch(protect , friendsControllers.updateFriends)
    .put(protect, friendsControllers.updateFriends)
    .delete(protect, friendsControllers.deleteFriend)




module.exports = router