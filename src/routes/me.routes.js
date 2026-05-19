import { Router } from "express";
import { getMe, updateAddress, updateMe } from "../controllers/me.controller.js";

export const meRouter = Router();

meRouter.get("/", getMe);
meRouter.patch("/", updateMe);
meRouter.patch("/address", updateAddress);
