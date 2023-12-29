const productModel = require("../models/Product");

const createProduct = async (req, res) => {
  const product = new productModel(req.body);
  product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100));  ;
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json(error);
  }
};

const fetchAllProducts = async (req, res) => {
  let condition = {};
  if (!req.query.admin) {
    condition.deleted = { $ne: true };
  }
  let query = productModel.find(condition);
  let totalProductsQuery = productModel.find(condition);
  
  const searchTerm = req.query.title_like;

  const regex = new RegExp(searchTerm, "i");
  
  if (req.query.category) {
    query = query.find({ category: { $in: req.query.category.split(",") } });
    totalProductsQuery = totalProductsQuery.find({
      category: { $in: req.query.category.split(",") },
    });
  }
  if (req.query.brand) {
    query = query.find({ brand: { $in: req.query.brand.split(",") } });
    totalProductsQuery = totalProductsQuery.find({
      brand: { $in: req.query.brand.split(",") },
    });
  }
  if (searchTerm) {
    query = query.find({ title: { $regex: regex } });
    totalProductsQuery = totalProductsQuery.find({
      title: { $regex: regex },
    });
  }
  // if (searchTerm) {
    //   query = query.find({ title: searchTerm });
    //   totalProductsQuery = totalProductsQuery.find({
      //     title: searchTerm,
      //   });
      // }
      // if (req.query.title_like) {
        //   query = query.find({ title: req.query.title_like });
        //   totalProductsQuery = totalProductsQuery.find({
  //     title: req.query.title_like,
  //   });
  // }
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }
  if (req.query._page && req.query._limit) {
    // const pageSize = req.query._limit;
    // const page = req.query._page;
    // query = query.skip(pageSize * (page - 1)).limit(pageSize);
    
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
  }
  
  const totalDocs = await totalProductsQuery.count().exec();
  
  // console.log(totalDocs);A
  
  try {
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error in query execution:", error);
    res.status(400).json(error);
  }
};
const fetchProductById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const product = await productModel.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json(error);
  }
};
const updateProduct = async (req, res) => {
  const { id } = req.params;
  
  try {
    const product = await productModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100));  ;
    const updateProduct = await product.save()
    res.status(200).json(updateProduct);
  } catch (error) {
    res.status(400).json(error);
  }
};

// const searchProductByTitle = async (req, res) => {
//   const { title } = req.query;
//   try {
//     const product = await productModel.findById(id);
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(400).json(error);
//   }
// };

module.exports = {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
};
