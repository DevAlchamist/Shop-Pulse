const orderModel = require("../models/Order");

const fetchOrderByUser = async (req, res) => {
  const { id } = req.user;

  try {
    const orderItems = await orderModel
      .find({ user: id })
    res.status(200).json(orderItems);
  } catch (error) {
    res.status(400).json(error);
  }
};
const createOrder = async (req, res) => {
  const order = new orderModel(req.body);
  try {
    const doc = await order.save();
    // const result = await doc.populate("product");
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json(error);
  }
};
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await orderModel.findByIdAndDelete(id);
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};
const updateOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await orderModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    // const result = await order.populate("product");
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

const fetchAllOrders = async (req, res) => {
  let query = orderModel.find({ deleted: { $ne: true } });
  let totalOrdersQuery = orderModel.find({ deleted: { $ne: true } });

  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }
  if (req.query._page && req.query._limit) {
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
  }

  const totalDocs = await totalOrdersQuery.count().exec();

  try {
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error in query execution:", error);
    res.status(400).json(error);
  }
};

module.exports = {fetchAllOrders, fetchOrderByUser, createOrder, updateOrder, deleteOrder };
