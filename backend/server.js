const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

const seedDatabase = require("./utils/seed");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.listen(5000, () => {
  console.log("Server Started");
});