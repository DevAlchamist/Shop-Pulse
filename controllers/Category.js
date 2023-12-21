const categoryModel = require("../models/Category");

const fetchCategory = async (req, res) => {
  try {
    const category = await categoryModel.find({}).exec();
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json(error);
  }
};

const createCategory = async (req, res) => {
  const category = new categoryModel(req.body);
  try {
    const doc = await category.save();
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = { fetchCategory, createCategory };
