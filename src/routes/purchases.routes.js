import { Router } from "express";
import { listRecentPurchases } from "../controllers/purchases.controller.js";

export const purchasesRouter = Router();

purchasesRouter.get("/recent", listRecentPurchases);
