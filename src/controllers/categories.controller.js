import { prisma } from "../lib/prisma.js";
import { asyncHandler, ok } from "../utils/response.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  ok(res, categories.map((category) => ({
    code: category.code,
    icon: category.icon,
    name: { en: category.nameEn, zh: category.nameZh },
    sortOrder: category.sortOrder
  })));
});
