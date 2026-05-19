import { Router } from "express";
import { claimBundle, listBundles } from "../controllers/bundles.controller.js";

export const bundlesRouter = Router();

bundlesRouter.get("/", listBundles);
bundlesRouter.post("/:bundleId/claim", claimBundle);
