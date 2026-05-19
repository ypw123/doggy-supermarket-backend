import { Router } from "express";
import { listPromotions } from "../controllers/promotions.controller.js";

export const promotionsRouter = Router();

promotionsRouter.get("/", listPromotions);
