import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { clearSessionCookie, setSessionCookie } from "../utils/authSession.js";
import { asyncHandler, fail, ok } from "../utils/response.js";
import { requireUser } from "../utils/requestUser.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeName(name, email) {
  const trimmed = String(name || "").trim();
  if (trimmed) return trimmed;
  return email.split("@")[0] || "Pawberry Customer";
}

function generateMemberNo() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PB-${random}`;
}

async function generateUniqueMemberNo() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const memberNo = generateMemberNo();
    const existing = await prisma.user.findUnique({ where: { memberNo } });
    if (!existing) return memberNo;
  }

  throw fail(500, "MEMBER_NO_FAILED", "Could not create a member number.");
}

export function customerPayload(user) {
  const address = user.addresses?.[0];

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: { en: user.nameEn, zh: user.nameZh },
    avatar: user.avatar,
    tier: { en: user.tierEn, zh: user.tierZh },
    memberNo: user.memberNo,
    points: user.points,
    recentOrders: user.orders
      ? user.orders.map((order) => ({
          id: order.orderNumber,
          status: { en: order.status, zh: order.status },
          title: { en: order.items?.[0]?.productNameEn || "Order", zh: order.items?.[0]?.productNameZh || "订单" },
          total: `$${Math.round(order.totalCents / 100)}`
        }))
      : [],
    address: address
      ? {
          id: address.id,
          receiver: address.receiver,
          phone: address.phone,
          province: address.province,
          city: address.city,
          district: address.district,
          line1: address.line1,
          line2: address.line2,
          zh: [address.province, address.city, address.district, address.line1].filter(Boolean).join(" "),
          en: address.line1
        }
      : null
  };
}

async function findUserForSession(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true }
      }
    }
  });
}

export const register = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const confirmPassword = String(req.body?.confirmPassword || "");
  const name = normalizeName(req.body?.name, email);

  if (!emailPattern.test(email)) {
    throw fail(400, "INVALID_EMAIL", "Please enter a valid email address.");
  }

  if (password.length < 8) {
    throw fail(400, "WEAK_PASSWORD", "Password must be at least 8 characters.");
  }

  if (!confirmPassword || password !== confirmPassword) {
    throw fail(400, "PASSWORD_MISMATCH", "Passwords do not match.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw fail(409, "EMAIL_EXISTS", "This email is already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nameEn: name,
      nameZh: name,
      memberNo: await generateUniqueMemberNo()
    },
    include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } }
  });

  setSessionCookie(res, user);
  ok(res, { customer: customerPayload(user) }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!email || !password) {
    throw fail(400, "INVALID_LOGIN", "Email and password are required.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } }
  });

  const passwordMatches = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordMatches) {
    throw fail(401, "INVALID_LOGIN", "Email or password is incorrect.");
  }

  setSessionCookie(res, user);
  ok(res, { customer: customerPayload(user) });
});

export const currentUser = asyncHandler(async (req, res) => {
  const sessionUser = await requireUser(req);
  const user = await findUserForSession(sessionUser.id);
  ok(res, { customer: customerPayload(user) });
});

export const previewLogin = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || "Berry Dog Parent").trim();
  const email = normalizeEmail(req.body?.email || "preview@pawberry.local");
  const passwordHash = await bcrypt.hash("preview-password", 12);

  const user = await prisma.user.upsert({
    where: { memberNo: "PB-0526" },
    update: {
      email,
      passwordHash,
      nameEn: name,
      nameZh: name
    },
    create: {
      id: "preview-customer-001",
      email,
      passwordHash,
      nameEn: name,
      nameZh: name,
      memberNo: "PB-0526",
      points: 860
    },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true }
      }
    }
  });

  setSessionCookie(res, user);
  ok(res, { customer: customerPayload(user) });
});

export const logout = asyncHandler(async (req, res) => {
  clearSessionCookie(res);
  ok(res, { message: "Logged out." });
});
