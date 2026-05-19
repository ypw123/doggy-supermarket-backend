import { Router } from "express";
import { currentUser, login, logout, previewLogin, register } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/preview-login", previewLogin);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", currentUser);
