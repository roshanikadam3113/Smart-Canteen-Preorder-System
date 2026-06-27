const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getFoods,
  addFood,
  updateFood,
  deleteFood,
  toggleStock,
} = require("../controllers/foodController");

router.get("/", getFoods);
router.post("/", protect, adminOnly, upload.single("image"), addFood);
router.put("/:id", protect, adminOnly, upload.single("image"), updateFood);
router.delete("/:id", protect, adminOnly, deleteFood);
router.put("/:id/toggle-stock", protect, adminOnly, toggleStock);

module.exports = router;
