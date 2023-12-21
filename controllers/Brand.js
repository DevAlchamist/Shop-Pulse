const brandModel = require("../models/Brand");

const fetchBrands = async (req, res) => {
  try {
    const brands = await brandModel.find({}).exec();
    res.status(200).json(brands);
  } catch (error) {
    res.status(400).json(error);
  }
};
const createBrand = async (req, res) => {
  const brand = new brandModel(req.body);
  try {
    const doc = await brand.save();
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = { fetchBrands, createBrand };
