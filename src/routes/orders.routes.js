import { Router } from "express";
import { createOrder, getOrder, listOrders } from "../controllers/orders.controller.js";

export const ordersRouter = Router();

ordersRouter.get("/", listOrders);
ordersRouter.post("/", createOrder);
ordersRouter.get("/:orderId", getOrder);
