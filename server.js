require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');
const protect = require("./middlewares/authUser")

const http = require("http");
const { Server } = require("socket.io");
const { exit } = require('process');

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
app.use(cors({
    origin: ['localhost:3000', 'sudochat.netlyfy.app'],
    methods: ["GET","POST","PUT","PATCH","DELETE"]
}))
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


mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URI);
    console.log("Connected to MongoDB");

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: ['localhost:3000', 'sudochat.netlyfy.app'],
        methods: ["GET","POST","PUT","PATCH","DELETE"]
      }
    });

    io.on("connection", (socket) => {
      console.log(`User ${socket.id} connected`);

      socket.on("join_chat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat: ${chatId}`);
      })

      socket.on("send_message", (message_data) => {
        // console.log(messages_data)
        console.log(`sending messages ${message_data.text}`)
        socket.to(message_data.to).emit("receive_message", message_data)
      })

      socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
      })
    });

    server.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(err);
    exit(1)
  }
};

connectDB();
