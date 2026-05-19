import { prisma } from "../lib/prisma.js";
import { customerPayload } from "./auth.controller.js";
import { asyncHandler, fail, ok } from "../utils/response.js";
import { requireUser } from "../utils/requestUser.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  ok(res, customerPayload(user));
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const name = String(req.body?.name || "").trim();

  if (!name) {
    throw fail(400, "INVALID_NAME", "Name is required.");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { nameEn: name, nameZh: name },
    include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } }
  });

  ok(res, customerPayload(updated));
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await requireUser(req);
  const line1 = String(req.body?.line1 || req.body?.address || "").trim();

  if (!line1) {
    throw fail(400, "INVALID_ADDRESS", "Address line is required.");
  }

  const current = user.addresses?.[0];
  const data = {
    receiver: req.body?.receiver || user.nameZh,
    phone: req.body?.phone || user.phone,
    province: req.body?.province || "上海市",
    city: req.body?.city || "上海市",
    district: req.body?.district || "浦东新区",
    line1,
    line2: req.body?.line2 || null,
    isDefault: true
  };

  if (current) {
    await prisma.address.update({ where: { id: current.id }, data });
  } else {
    await prisma.address.create({ data: { ...data, userId: user.id } });
  }

  const updated = await prisma.user.findUnique({
    where: { id: user.id },
    include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } }
  });

  ok(res, customerPayload(updated));
});
