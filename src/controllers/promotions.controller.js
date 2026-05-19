import { prisma } from "../lib/prisma.js";
import { asyncHandler, ok } from "../utils/response.js";

export const listPromotions = asyncHandler(async (req, res) => {
  const promotions = await prisma.promotion.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });

  ok(res, promotions.map((promotion) => ({
    code: promotion.code,
    title: { en: promotion.titleEn, zh: promotion.titleZh },
    description: { en: promotion.descriptionEn, zh: promotion.descriptionZh },
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    status: promotion.status
  })));
});
