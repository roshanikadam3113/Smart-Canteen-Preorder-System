const express = require("express");

const router = express.Router();

const Food = require("../models/Food");

router.get("/", async (req, res) => {

    try {

        const foods = await Food.find();

        res.send(foods);

    } catch (error) {

        res.send(error);

    }

});

router.post("/", async (req, res) => {

    try {

        const newFood = await Food.create(req.body);

        res.send(newFood);

    } catch (error) {

        res.send(error);

    }

});
module.exports = router;