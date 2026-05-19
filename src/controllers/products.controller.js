import { prisma } from "../lib/prisma.js";
import { asyncHandler, fail, ok, productPayload } from "../utils/response.js";

function buildProductWhere(query) {
  const where = {};

  if (query.status) {
    where.status = query.status;
  } else {
    where.status = "ACTIVE";
  }

  if (query.category && query.category !== "All") {
    where.category = { code: query.category };
  }

  if (query.q) {
    const q = String(query.q).trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { nameZh: { contains: q, mode: "insensitive" } },
      { detailEn: { contains: q, mode: "insensitive" } },
      { detailZh: { contains: q, mode: "insensitive" } },
      { tagEn: { contains: q, mode: "insensitive" } },
      { tagZh: { contains: q, mode: "insensitive" } }
    ];
  }

  return where;
}

export const listProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: buildProductWhere(req.query),
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  ok(res, products.map(productPayload));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { code: req.params.productId },
    include: { category: true }
  });

  if (!product) {
    throw fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  ok(res, productPayload(product));
});
