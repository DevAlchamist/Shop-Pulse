const express = require("express");
const {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
} = require("../controllers/Product");

const router = express.Router();

router.get("/", fetchAllProducts);
router.post("/", createProduct);

router.get("/:id", fetchProductById);

router.patch("/:id", updateProduct);

module.exports = router;
