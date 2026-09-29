const Product = require("../models/Product");

// Create Product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Products
// const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find({
//       userId: req.user._id,
//     }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       data: products,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const getProducts = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const keyword = req.query.search
      ? {
          $or: [
            {
              productName: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              description: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              unit: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const filter = {
      userId: req.user._id,
      ...keyword,
    };

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      count: products.length,
      data: products,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// Get Single Product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};