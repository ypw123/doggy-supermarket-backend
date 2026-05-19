import { prisma } from "../lib/prisma.js";
import { fail } from "./response.js";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./authSession.js";

export function getUserId(req) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    throw fail(401, "AUTH_REQUIRED", "Please log in first.");
  }

  try {
    const payload = verifySessionToken(token);
    return payload.sub;
  } catch {
    throw fail(401, "INVALID_SESSION", "Your login session has expired. Please log in again.");
  }
}

export async function requireUser(req) {
  const userId = getUserId(req);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }
    }
  });

  if (!user) {
    throw fail(401, "USER_NOT_FOUND", "User session is missing. Please log in first.");
  }

  return user;
}

export async function ensureActiveCart(userId) {
  const existing = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { items: { include: { product: { include: { category: true } } }, orderBy: { createdAt: "asc" } } }
  });

  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: { items: { include: { product: { include: { category: true } } } } }
  });
}
