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
  const quantity = Math.max(1, Number(req.body?.quantity || 1));

  const product = await prisma.product.findFirst({
    where: { code: productId, status: "ACTIVE" }
  });

  if (!product) {
    throw fail(404, "PRODUCT_NOT_FOUND", "Product not found or not active.");
  }

  const cart = await ensureActiveCart(user.id);

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
