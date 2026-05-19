import { prisma } from "../lib/prisma.js";
import { asyncHandler, cartPayload, fail, ok, productPayload } from "../utils/response.js";
import { ensureActiveCart, requireUser } from "../utils/requestUser.js";

function bundlePayload(bundle) {
  return {
    id: bundle.code,
    title: { en: bundle.titleEn, zh: bundle.titleZh },
    text: { en: bundle.textEn, zh: bundle.textZh },
    cta: { en: bundle.ctaEn, zh: bundle.ctaZh },
    status: { en: bundle.statusEn, zh: bundle.statusZh },
    price: `$${Math.round(bundle.priceCents / 100)}`,
    priceCents: bundle.priceCents,
    currency: bundle.currency,
    items: bundle.items.map((item) => ({
      quantity: item.quantity,
      product: productPayload(item.product)
    }))
  };
}

export const listBundles = asyncHandler(async (req, res) => {
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    include: { items: { include: { product: { include: { category: true } } } } },
    orderBy: { sortOrder: "asc" }
  });

  ok(res, bundles.map(bundlePayload));
});

export const claimBundle = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const bundle = await prisma.bundle.findUnique({
    where: { code: req.params.bundleId },
    include: { items: { include: { product: { include: { category: true } } } } }
  });

  if (!bundle || !bundle.isActive) {
    throw fail(404, "BUNDLE_NOT_FOUND", "Bundle not found.");
  }

  const cart = await ensureActiveCart(user.id);

  for (const item of bundle.items) {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      update: { quantity: { increment: item.quantity } },
      create: { cartId: cart.id, productId: item.productId, quantity: item.quantity }
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { category: true } } }, orderBy: { createdAt: "asc" } } }
  });

  ok(res, {
    bundle: bundlePayload(bundle),
    cart: cartPayload(updatedCart)
  });
});
