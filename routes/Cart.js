const express = require("express");
const {
  fetchCartByUser,
  addToCart,
  updateCart,
  deleteFromCart,
} = require("../controllers/Cart");

const router = express.Router();

router.get("/", fetchCartByUser);
router.post("/", addToCart);
router.patch("/:id", updateCart);
router.delete("/:id", deleteFromCart);

module.exports = router;
