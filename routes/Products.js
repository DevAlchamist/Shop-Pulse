const express = require("express");
const {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
} = require("../controllers/Product");
const productModel = require("../models/Product");

const router = express.Router();

router
  .get("/", fetchAllProducts)
  .post("/", createProduct)
  .get("/:id", fetchProductById)
  .patch("/:id", updateProduct)
// if want to update discountPrice in database
//   router.get("/update/test", async (req, res) => {
//   const products = await productModel.find({});
//   for (let product of products) {
//     product.discountPrice = Math.round(
//       product.price * (1 - product.discountPercentage / 100)
//     );
//     await product.save();
//     console.log(product.title + " updated " + product.discountPrice);
//   }
//   res.send("ok");
// });

module.exports = router;
