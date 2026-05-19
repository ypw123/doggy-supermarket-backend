import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import { apiRouter } from "./routes/index.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const clientOrigin = process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173";

export const app = express();

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/admin", adminRouter);
app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
