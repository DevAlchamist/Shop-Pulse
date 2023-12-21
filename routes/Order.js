const express = require("express");
const {
  fetchOrderByUser,
  createOrder,
  updateOrder,
  deleteOrder,
  fetchAllOrders,
} = require("../controllers/Order");

const router = express.Router();

router.get("/own/", fetchOrderByUser)
      .get("/",fetchAllOrders)
      .post("/", createOrder)
      .patch("/:id", updateOrder)
      .delete("/:id", deleteOrder)

module.exports = router;
