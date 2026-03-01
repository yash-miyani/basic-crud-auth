const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
