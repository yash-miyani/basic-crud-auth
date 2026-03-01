const Product = require("../models/productModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const handleCreateProduct = catchAsync(async (req, res, next) => {
  const { name, price, category } = req.body;

  if (!name || !price || !category) {
    return next(new ApiError(400, "Please provide all fields"));
  }

  const product = await Product.create({
    name,
    price,
    category,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

const handleUpdateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, category } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }

  product.name = name || product.name;
  product.price = price || product.price;
  product.category = category || product.category;

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Product updated successfully", product));
});

const handleDeleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product deleted successfully"));
});

const handleGetAllProducts = async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  try {
    const query = {};

    let products;

    // Step 1: Search by name or category
    if (search) {
      const searchQuery = {
        ...query,
        $or: [
          { name: { $regex: new RegExp(search, "i") } },
          { category: { $regex: new RegExp(search, "i") } },
        ],
      };

      products = await Product.find(searchQuery)
        .skip(skip)
        .limit(Number(limit))
        .exec();
    } else {
      products = await Product.find(query)
        .skip(skip)
        .limit(Number(limit))
        .exec();
    }

    if (!products || products.length === 0) {
      return next(new ApiError(404, "No products found"));
    }

    // Total records for pagination
    const totalRecords = await Product.countDocuments(
      search
        ? {
            $or: [
              { name: { $regex: new RegExp(search, "i") } },
              { category: { $regex: new RegExp(search, "i") } },
            ],
          }
        : {},
    );

    const pages = Math.ceil(totalRecords / limit);

    const pagination = {
      current: Number(page),
      limit: Number(limit),
      next: {
        page: Number(page) < pages ? Number(page) + 1 : null,
        limit: Number(limit),
      },
      pages,
      records: totalRecords,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Product list retrieved successfully",
          products,
          pagination,
        ),
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetAllProducts,
};
