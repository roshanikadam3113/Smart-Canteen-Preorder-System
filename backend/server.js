const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

const seedDatabase = require("./utils/seed");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

io.on("connection", (socket) => {
  socket.on("join", (email) => {
    if (email) {
      const roomName = email.toLowerCase().trim();
      socket.join(roomName);
      console.log(`Socket client joined room: ${roomName}`);
    }
  });
});

app.set("io", io);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected");
    seedDatabase();
  })
  .catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.use("/foods", foodRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

server.listen(5000, () => {
  console.log("Server Started");
});