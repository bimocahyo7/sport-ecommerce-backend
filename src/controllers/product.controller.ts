import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/product.model";
import Category from "../models/category.model";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, stock, price, categoryId } = req.body;

    // Validation input
    if (!name || !description || stock === undefined || price === undefined || !categoryId) {
      res.status(400).json({ message: "Name, description, stock, price, and categoryId are required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Image is required" });
      return;
    }

    if (isNaN(Number(stock)) || Number(stock) < 0) {
      res.status(400).json({ message: "Stock must be a positive number" });
      return;
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      res.status(400).json({ message: "Price must be a positive number" });
      return;
    }

    // Validation categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ message: "Invalid category ID format" });
      return;
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const product = new Product({
      name,
      description,
      stock: Number(stock),
      price: Number(price),
      category: categoryId,
      imageUrl: req.file.path,
    });

    await product.save();
    await product.populate("category");

    res.status(201).json({ message: "Product created successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().populate("category").sort({ createdAt: -1 });
    res.status(200).json({ message: `Found ${products.length} products`, data: products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid product ID format" });
      return;
    }

    const product = await Product.findById(id).populate("category");

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({ message: "Product found", data: product });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, stock, price, categoryId } = req.body;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid product ID format" });
      return;
    }

    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      res.status(400).json({ message: "Stock must be a positive number" });
      return;
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      res.status(400).json({ message: "Price must be a positive number" });
      return;
    }

    if (categoryId) {
      // Check if categoryId has valid ObjectId format
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        res.status(400).json({ message: "Invalid category ID format" });
        return;
      }

      // Check if category exists in database
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
    }

    // Update object with only provided fields
    const productData: any = {};
    if (name) productData.name = name;
    if (description) productData.description = description;
    if (stock !== undefined) productData.stock = Number(stock);
    if (price !== undefined) productData.price = Number(price);
    if (categoryId) productData.category = categoryId;
    if (req.file) productData.imageUrl = req.file.path;

    const product = await Product.findByIdAndUpdate(id, productData, { new: true }).populate("category");

    // Check if product exists
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({ message: "Product updated successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid product ID format" });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
};
