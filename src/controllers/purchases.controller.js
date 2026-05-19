import { prisma } from "../lib/prisma.js";
import { asyncHandler, ok } from "../utils/response.js";

function timeAgo(purchasedAt) {
  const minutes = Math.max(1, Math.round((Date.now() - purchasedAt.getTime()) / 60000));
  return {
    en: `${minutes} min ago`,
    zh: `${minutes} 分钟前`
  };
}

export const listRecentPurchases = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 12), 30);
  const purchases = await prisma.recentPurchase.findMany({
    take: limit,
    orderBy: { purchasedAt: "desc" }
  });

  ok(res, purchases.map((purchase) => ({
    id: purchase.id,
    city: { en: purchase.cityEn, zh: purchase.cityZh },
    buyer: { en: purchase.buyerEn, zh: purchase.buyerZh },
    product: { en: purchase.productNameEn, zh: purchase.productNameZh },
    quantity: purchase.quantity,
    timeAgo: timeAgo(purchase.purchasedAt)
  })));
});
