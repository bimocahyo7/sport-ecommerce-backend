import { Router } from "express";
import { signInAdmin, registerAdmin } from "../controllers/auth.controller";

const router = Router();

router.post("/signin", signInAdmin);
router.post("/create-admin", registerAdmin);

export default router;
