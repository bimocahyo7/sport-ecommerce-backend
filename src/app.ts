import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route";
import categoryRoutes from "./routes/category.route";
import productRoutes from "./routes/product.route";
import bankRoutes from "./routes/bank.route";
import transactionRoutes from "./routes/transaction.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Backend Express API is running");
});

export default app;
