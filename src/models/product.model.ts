import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  stock: number;
  price: number;
  imageUrl: string;
  category: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IProduct>("Product", ProductSchema);
