import mongoose, { Schema, Document } from "mongoose";

export interface IPurchasedItems {
  productId: mongoose.Types.ObjectId;
  qty: number;
}

export interface ITransaction extends Document {
  paymentProof: string;
  status: "pending" | "paid" | "rejected";
  purchasedItems: IPurchasedItems[];
  totalPayment: number;
  customerName: string;
  customerContact: string;
  customerAddress: string;
}

const PurchasedItemSchema: Schema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const TransactionSchema: Schema = new Schema(
  {
    paymentProof: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
      required: true,
    },
    purchasedItems: { type: [PurchasedItemSchema], required: true },
    totalPayment: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerContact: { type: String, required: true },
    customerAddress: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
