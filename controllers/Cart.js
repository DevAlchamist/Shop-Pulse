const cartModel = require("../models/Cart");

const fetchCartByUser = async (req, res) => {
  const { id } = req.user;

  try {
    const cartItems = await cartModel
      .find({ user: id })
      .populate("user")
      .populate("product");
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(400).json(error);
  }
};
const addToCart = async (req, res) => {
  const { id } = req.user;
  const cart = new cartModel({...req.body,user: id}); 
  try {
    const doc = await cart.save();
    const result = await doc.populate("product");
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
};
const deleteFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await cartModel.findByIdAndDelete(id);
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json(error);
  }
};
const updateCart = async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await cartModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    const result = await cart.populate('product')
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = { fetchCartByUser, addToCart, updateCart, deleteFromCart };
