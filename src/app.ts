import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import { authenticate } from "./middlewares/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.get("/testing-middleware", authenticate, (req, res) => {
  res.send("Endpoint testing protected by middleware");
});

app.get("/", (req, res) => {
  res.send("Backend Express API is running");
});

export default app;
