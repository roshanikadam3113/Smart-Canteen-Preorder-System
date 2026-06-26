const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

//import food Routes
const foodRoutes=require("./routes/foodRoutes");

const authRoutes=require("./routes/authRoutes");

const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((error) => {
    console.log(error);
});

// Home Route
app.get("/", (req, res) => {
    res.send("Backend Running");
});

// Food Route
app.use("/foods",foodRoutes);

//User route
app.use("/auth",authRoutes);

//order route
app.use("/orders",orderRoutes);

app.listen(5000, () => {
    console.log("Server Started");
});