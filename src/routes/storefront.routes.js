import { Router } from "express";
import { getStorefront } from "../controllers/storefront.controller.js";

export const storefrontRouter = Router();

storefrontRouter.get("/", getStorefront);
