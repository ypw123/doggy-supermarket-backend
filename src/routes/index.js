import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { storefrontRouter } from "./storefront.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { productsRouter } from "./products.routes.js";
import { authRouter } from "./auth.routes.js";
import { meRouter } from "./me.routes.js";
import { cartRouter } from "./cart.routes.js";
import { ordersRouter } from "./orders.routes.js";
import { bundlesRouter } from "./bundles.routes.js";
import { promotionsRouter } from "./promotions.routes.js";
import { purchasesRouter } from "./purchases.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/storefront", storefrontRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/me", meRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/bundles", bundlesRouter);
apiRouter.use("/promotions", promotionsRouter);
apiRouter.use("/purchases", purchasesRouter);
