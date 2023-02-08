require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');
const protect = require("./middlewares/authUser")

const cloudinaryConfig = cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const PORT = process.env.PORT || 3500
const DATABASE_URI = process.env.DATABASE_URI;
const app = express();

// Defining middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routing
app.use(express.static(__dirname + '/public'));
app.use('/', require('./routes/root.js'));
app.use('/api/user', require('./routes/userRoutes.js'));
app.use('/api/chat', protect, require('./routes/chatRoutes.js'));
app.use('/api/message', protect, require('./routes/messageRoutes.js'));

app.get('/get-cloud-signature', (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp
      },
      cloudinaryConfig.api_secret
    )
    res.json({ timestamp, signature })
  })


app.all("*", (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(__dirname + '/views/404.html')
    } else if (req.accepts("json")) {
        res.json({ message: "404 Not found" })
    } else {
        res.type("txt").send("404 Not found")
    }
})


// Connecting to MongoDB
mongoose.set('strictQuery', true)
const connectDB = async () => {
    try {
        await mongoose.connect(DATABASE_URI)
    } catch (err) {
        console.log(err)
    }
}
connectDB()

// Starting server and MongoDB
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`))

})

//Checking for err in MongoDB
mongoose.connection.on("error", err => {
    console.log(err)
})