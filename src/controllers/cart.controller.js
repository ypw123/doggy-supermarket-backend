import { prisma } from "../lib/prisma.js";
import { asyncHandler, cartPayload, fail, ok } from "../utils/response.js";
import { ensureActiveCart, requireUser } from "../utils/requestUser.js";

async function readCart(userId) {
  const cart = await ensureActiveCart(userId);
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export const getCart = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  ok(res, cartPayload(await readCart(user.id)));
});

export const addCartItem = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const productId = String(req.body?.productId || "").trim();
  const requestedQuantity = Number(req.body?.quantity ?? 1);

  if (!productId) {
    throw fail(400, "PRODUCT_ID_REQUIRED", "Product id is required.");
  }

  if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
    throw fail(400, "INVALID_QUANTITY", "Quantity must be a positive number.");
  }

  const quantity = Math.max(1, Math.floor(requestedQuantity));

  const product = await prisma.product.findFirst({
    where: { code: productId, status: "ACTIVE" }
  });

  if (!product) {
    throw fail(404, "PRODUCT_NOT_FOUND", "Product not found or not active.");
  }

  if (product.stock <= 0) {
    throw fail(409, "OUT_OF_STOCK", "This item is out of stock.");
  }

  const cart = await ensureActiveCart(user.id);
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } }
  });
  const nextQuantity = (existingItem?.quantity || 0) + quantity;

  if (nextQuantity > product.stock) {
    throw fail(409, "INSUFFICIENT_STOCK", "There is not enough stock for this item.", {
      stock: product.stock,
      requestedQuantity: nextQuantity
    });
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId: product.id, quantity }
  });

  ok(res, cartPayload(await readCart(user.id)), 201);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const productId = req.params.productId;
  const quantity = Number(req.body?.quantity);
  const cart = await ensureActiveCart(user.id);
  const product = await prisma.product.findUnique({ where: { code: productId } });

  if (!product) {
    throw fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } }
  });

  if (!item) {
    throw fail(404, "CART_ITEM_NOT_FOUND", "Cart item not found.");
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }

  ok(res, cartPayload(await readCart(user.id)));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const productId = req.params.productId;
  const cart = await ensureActiveCart(user.id);
  const product = await prisma.product.findUnique({ where: { code: productId } });

  if (!product) {
    throw fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId: product.id }
  });

  ok(res, cartPayload(await readCart(user.id)));
});
