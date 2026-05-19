import { Router } from "express";
import {
  createAdminRow,
  deleteAdminRow,
  getAdminSummary,
  getAdminTable,
  renderAdminPage
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.get("/", renderAdminPage);
adminRouter.get("/api/summary", getAdminSummary);
adminRouter.get("/api/tables/:tableKey", getAdminTable);
adminRouter.post("/api/tables/:tableKey", createAdminRow);
adminRouter.delete("/api/tables/:tableKey/:rowId", deleteAdminRow);
