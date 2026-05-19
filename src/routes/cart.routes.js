import { Router } from "express";
import { addCartItem, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js";

export const cartRouter = Router();

cartRouter.get("/", getCart);
cartRouter.post("/items", addCartItem);
cartRouter.patch("/items/:productId", updateCartItem);
cartRouter.delete("/items/:productId", removeCartItem);
