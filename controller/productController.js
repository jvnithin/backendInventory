import Product from "../models/productModel.js";
import User from "../models/userModel.js";
const getById = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId)
      return res.status(400).json({ error: "Product ID is required" });
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const wholesaler_id = req.user.userId;
    if (!wholesaler_id)
      return res.status(401).json({ message: "Unauthorized" });
    const {
      name,
      stock = 0,
      price,
      mrp,
      description = "",
      alternative_names = [],
    } = req.body;
    if (!name || !price || !mrp)
      return res.status(400).json({ message: "All fields are required" });
    const wholesaler = await User.findByPk(wholesaler_id);
    if (!wholesaler)
      return res.status(404).json({ message: "Wholesaler not found" });
    const product = await Product.create({
      name,
      stock,
      price,
      mrp,
      description,
      wholesaler_id,
      alternative_names,
    });
    return res.json({ product, message: "Product created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId;
    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });
    const {
      name,
      stock = 0,
      price,
      mrp,
      description = "",
      alternative_names = [],
    } = req.body;
    if (!name || !price || !mrp)
      return res.status(400).json({ message: "All fields are required" });

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (parseInt(userId) !== parseInt(product.wholesaler_id)){
      // console.log(userId, product.wholesaler_id);
      return res
        .status(401)
        .json({ message: "You don't have access to edit this product" });
    }
    product.name = name;
    product.stock = stock;
    product.price = price;
    product.mrp = mrp;
    product.description = description;
    product.alternative_names = alternative_names;

    await product.save();

    return res.json({ product, message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId;
    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (parseInt(userId) !== parseInt(product.wholesaler_id)){
      // console.log(userId, product.wholesaler_id);
      return res
        .status(401)
        .json({ message: "You don't have access to delete this product" });
    }
    await product.destroy();

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default { getById, createProduct, updateProduct, deleteProduct };
