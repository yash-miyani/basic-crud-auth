const express = require("express");
const {
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetAllProducts,
} = require("../controllers/productController");
const router = express.Router();

// Create Product
router.post("/", handleCreateProduct);

// Update Product
router.put("/:id", handleUpdateProduct);

// Delete Product
router.delete("/:id", handleDeleteProduct);

// Get All Products
router.get("/", handleGetAllProducts);

module.exports = router;
