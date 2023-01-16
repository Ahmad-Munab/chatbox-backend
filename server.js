require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

PORT = 3500;
DATABASE_URI = process.env.DATABASE_URI;
console.log(DATABASE_URI)
const app = express();

// Defining middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing
app.use(express.static(__dirname + '/public'));
app.use('/', require('./routes/root.js'));


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