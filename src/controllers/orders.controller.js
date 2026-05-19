import { prisma } from "../lib/prisma.js";
import { asyncHandler, cartPayload, fail, ok, orderPayload } from "../utils/response.js";
import { ensureActiveCart, requireUser } from "../utils/requestUser.js";

function nextOrderNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `PB${stamp}${String(date.getTime()).slice(-5)}`;
}

export const listOrders = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  ok(res, orders.map(orderPayload));
});

export const getOrder = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const order = await prisma.order.findFirst({
    where: { id: req.params.orderId, userId: user.id },
    include: { items: true }
  });

  if (!order) {
    throw fail(404, "ORDER_NOT_FOUND", "Order not found.");
  }

  ok(res, orderPayload(order));
});

export const createOrder = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const cart = await ensureActiveCart(user.id);
  const freshCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!freshCart.items.length) {
    throw fail(400, "EMPTY_CART", "Cart is empty.");
  }

  const snapshot = cartPayload(freshCart);
  const address = user.addresses?.[0];
  const totalCents = snapshot.subtotalCents;
  const points = Math.floor(totalCents / 100);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: nextOrderNumber(),
        userId: user.id,
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        subtotalCents: snapshot.subtotalCents,
        totalCents,
        shippingName: req.body?.shippingName || address?.receiver || user.nameZh,
        shippingPhone: req.body?.shippingPhone || address?.phone || user.phone,
        shippingAddress: req.body?.shippingAddress || [address?.province, address?.city, address?.district, address?.line1].filter(Boolean).join(" "),
        items: {
          create: freshCart.items.map((item) => ({
            productId: item.productId,
            productCode: item.product.code,
            productNameEn: item.product.nameEn,
            productNameZh: item.product.nameZh,
            imageUrl: item.product.imageUrl,
            unitPriceCents: item.product.priceCents,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });

    await tx.cartItem.deleteMany({ where: { cartId: freshCart.id } });
    await tx.user.update({ where: { id: user.id }, data: { points: { increment: points } } });
    await tx.pointLog.create({
      data: {
        userId: user.id,
        points,
        reasonEn: "Order reservation",
        reasonZh: "订单预留",
        source: "ORDER",
        referenceId: created.id
      }
    });

    return created;
  });

  ok(res, orderPayload(order), 201);
});
