import { prisma } from "../lib/prisma.js";
import { asyncHandler, ok } from "../utils/response.js";

export const getStorefront = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  ok(res, {
    copy: {
      en: {
        brand: "Pawberry Dog Mart",
        loading: "Stocking the shelves...",
        nav: { shop: "Aisles", bundles: "Deals", care: "Care", contact: "Contact", search: "Search the mart" }
      },
      zh: {
        brand: "Pawberry 狗狗超市",
        loading: "狗狗店长正在补货...",
        nav: { shop: "货架", bundles: "特惠", care: "养护", contact: "联系", search: "搜索超市" }
      }
    },
    categories: categories.map((category) => category.code),
    categoryDetails: categories.map((category) => ({
      code: category.code,
      icon: category.icon,
      name: { en: category.nameEn, zh: category.nameZh }
    })),
    assets: {
      managerDog: "/brand/pawberry-manager-dog.png"
    },
    featureFlags: {
      checkout: false,
      dogInteractionApi: false
    }
  });
});
