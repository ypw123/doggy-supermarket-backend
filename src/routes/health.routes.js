import { Router } from "express";
import { ok } from "../utils/response.js";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  ok(res, {
    service: "pawberry-api",
    status: "healthy",
    time: new Date().toISOString()
  });
});
