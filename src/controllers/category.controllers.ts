import { Request, Response } from "express";
import mongoose from "mongoose";
import Category from "../models/category.model";

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Image is required" });
      return;
    }

    // Check duplication category name
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingCategory) {
      res.status(409).json({ message: `Category "${name}" already exists` });
      return;
    }

    const category = new Category({
      name,
      description,
      imageUrl: req.file.path,
    });

    await category.save();
    res.status(201).json({ message: "Category created successfully", data: category });
  } catch (error) {
    res.status(500).json({ message: "Failed to create category", error });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ message: `Found ${categories.length} categories`, data: categories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validation ID format
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid category ID format" });
      return;
    }

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json({ message: "Category found", data: category });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category", error });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid category ID format" });
      return;
    }

    if (name) {
      const duplicate = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: new mongoose.Types.ObjectId(id as string) },
      });
      if (duplicate) {
        res.status(409).json({ message: `Category "${name}" already exists` });
        return;
      }
    }

    const categoryData: any = {};
    if (name) categoryData.name = name;
    if (description) categoryData.description = description;
    if (req.file) categoryData.imageUrl = req.file.path;

    const category = await Category.findByIdAndUpdate(id, categoryData, { new: true });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json({ message: "Category updated successfully", data: category });
  } catch (error) {
    res.status(500).json({ message: "Failed to update category", error });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid category ID format" });
      return;
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category", error });
  }
};
