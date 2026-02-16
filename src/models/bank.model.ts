import mongoose, { Schema, Document } from "mongoose";

export interface IBank extends Document {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const BankSchema: Schema = new Schema(
  {
    bankName: { type: String, required: true },
    accountName: { type: String, requiered: true },
    accountNumber: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IBank>("Bank", BankSchema);
