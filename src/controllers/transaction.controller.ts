import { Request, Response } from "express";
import mongoose from "mongoose";
import Transaction from "../models/transaction.model";
import Product from "../models/product.model";

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerContact, customerAddress, totalPayment, purchasedItems } = req.body;

    if (!customerName || !customerContact || !customerAddress) {
      res.status(400).json({ message: "Customer name, contact, and address are required" });
      return;
    }

    if (!totalPayment || isNaN(Number(totalPayment)) || Number(totalPayment) <= 0) {
      res.status(400).json({ message: "Total payment must be a positive number" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Payment proof image is required" });
      return;
    }

    // Parse purchasedItems if sent as string
    let parsedItems = purchasedItems;
    if (typeof purchasedItems === "string") {
      try {
        parsedItems = JSON.parse(purchasedItems);
      } catch {
        res.status(400).json({ message: "Invalid format for purchased items" });
        return;
      }
    }

    // Validate purchasedItems
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      res.status(400).json({ message: "At least one purchased item is required" });
      return;
    }

    // Validate each purchased item
    for (const item of parsedItems) {
      if (!item.productId || !item.qty) {
        res.status(400).json({ message: "Each item must have productId and qty" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        res.status(400).json({ message: `Invalid product ID format: ${item.productId}` });
        return;
      }

      if (isNaN(Number(item.qty)) || Number(item.qty) < 1) {
        res.status(400).json({ message: "Quantity must be at least 1" });
        return;
      }

      // Check if product exists
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Product not found: ${item.productId}` });
        return;
      }

      // Check stock availability
      if (product.stock < item.qty) {
        res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.qty}`,
        });
        return;
      }
    }

    const transaction = new Transaction({
      customerName,
      customerContact,
      customerAddress,
      totalPayment: Number(totalPayment),
      purchasedItems: parsedItems,
      paymentProof: req.file.path,
      status: "pending",
    });

    await transaction.save();
    await transaction.populate("purchasedItems.productId");

    res.status(201).json({ message: "Transaction created successfully", data: transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to create transaction", error });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Filter by status
    const { status } = req.query;
    const filter: any = {};

    if (status) {
      const validStatuses = ["pending", "paid", "rejected"];
      if (!validStatuses.includes(status as string)) {
        res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
        return;
      }
      filter.status = status;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate("purchasedItems.productId");

    res.status(200).json({ message: `Found ${transactions.length} transactions`, data: transactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
};

export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid transaction ID format" });
      return;
    }

    const transaction = await Transaction.findById(id).populate("purchasedItems.productId");

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json({ message: "Transaction found", data: transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction", error });
  }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid transaction ID format" });
      return;
    }

    // Validate status is provided
    if (!status) {
      res.status(400).json({ message: "Status is required" });
      return;
    }

    // Validate status value
    const validStatuses = ["pending", "paid", "rejected"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    // Prevent updating already paid/rejected transaction
    if (existingTransaction.status !== "pending") {
      res.status(400).json({
        message: `Cannot update transaction. Current status is already ${existingTransaction.status}`,
      });
      return;
    }

    // Reduce stock when status changed to "paid"
    if (status === "paid") {
      for (const item of existingTransaction.purchasedItems) {
        const product = await Product.findById(item.productId);

        // Check if stock is sufficient
        if (!product || product.stock < item.qty) {
          res.status(400).json({
            message: `Insufficient stock for "${product?.name || item.productId}". Available: ${product?.stock || 0}, requested: ${item.qty}`,
          });
          return;
        }
      }

      // Reduce stock after all validations pass
      for (const item of existingTransaction.purchasedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty },
        });
      }
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("purchasedItems.productId");

    res.status(200).json({ message: `Transaction ${status} successfully`, data: transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction status", error });
  }
};
