import { Request, Response } from "express";
import mongoose from "mongoose";
import Bank from "../models/bank.model";

export const createBank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bankName, accountName, accountNumber } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      res.status(400).json({ message: "Bank name, account name, and account number are required" });
      return;
    }

    // Check duplicate account number
    const existingBank = await Bank.findOne({ accountNumber });
    if (existingBank) {
      res.status(409).json({ message: `Account number "${accountNumber}" already exists` });
      return;
    }

    const bank = new Bank({
      bankName,
      accountName,
      accountNumber,
    });

    await bank.save();
    res.status(201).json({ message: "Bank created successfully", data: bank });
  } catch (error) {
    res.status(500).json({ message: "Failed to create bank", error });
  }
};

export const getBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const banks = await Bank.find().sort({ createdAt: -1 });
    res.status(200).json({ message: `Found ${banks.length} banks`, data: banks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch banks", error });
  }
};

export const getBankById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid bank ID format" });
      return;
    }

    const bank = await Bank.findById(id);

    if (!bank) {
      res.status(404).json({ message: "Bank not found" });
      return;
    }

    res.status(200).json({ message: "Bank found", data: bank });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bank", error });
  }
};

export const updateBank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { bankName, accountName, accountNumber } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid bank ID format" });
      return;
    }

    // Check duplicate account number
    if (accountNumber) {
      const duplicate = await Bank.findOne({
        accountNumber,
        _id: { $ne: new mongoose.Types.ObjectId(id as string) },
      });
      if (duplicate) {
        res.status(409).json({ message: `Account number "${accountNumber}" already exists` });
        return;
      }
    }

    const bankData: any = {};
    if (bankName) bankData.bankName = bankName;
    if (accountName) bankData.accountName = accountName;
    if (accountNumber) bankData.accountNumber = accountNumber;

    const bank = await Bank.findByIdAndUpdate(id, bankData, { new: true });

    if (!bank) {
      res.status(404).json({ message: "Bank not found" });
      return;
    }

    res.status(200).json({ message: "Bank updated successfully", data: bank });
  } catch (error) {
    res.status(500).json({ message: "Failed to update bank", error });
  }
};

export const deleteBank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid bank ID format" });
      return;
    }

    const bank = await Bank.findByIdAndDelete(id);

    if (!bank) {
      res.status(404).json({ message: "Bank not found" });
      return;
    }

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete bank", error });
  }
};