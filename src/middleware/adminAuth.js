import crypto from "node:crypto";

const ADMIN_COOKIE_NAME = "pawberry_admin";
const adminSessionMaxAgeMs = 1000 * 60 * 60 * 24 * 7;

function unauthorized(res) {
  res.set("WWW-Authenticate", 'Basic realm="Pawberry Admin", charset="UTF-8"');
  return res.status(401).send("Admin authentication required.");
}

function readBasicCredentials(header) {
  if (!header?.startsWith("Basic ")) return null;

  try {
    const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) return null;

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function adminSessionSecret() {
  return [process.env.JWT_SECRET, process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD].filter(Boolean).join(":");
}

function signAdminSession(username) {
  return crypto.createHmac("sha256", adminSessionSecret()).update(username).digest("hex");
}

function hasValidAdminSession(req, expectedUsername) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token) return false;

  const expectedToken = signAdminSession(expectedUsername);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

function setAdminSessionCookie(res, username) {
  res.cookie(ADMIN_COOKIE_NAME, signAdminSession(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: adminSessionMaxAgeMs,
    path: "/admin",
  });
}

export function requireAdminAuth(req, res, next) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return unauthorized(res);
  }

  if (hasValidAdminSession(req, expectedUsername)) {
    return next();
  }

  const credentials = readBasicCredentials(req.get("authorization"));
  if (credentials?.username !== expectedUsername || credentials?.password !== expectedPassword) {
    return unauthorized(res);
  }

  setAdminSessionCookie(res, expectedUsername);
  return next();
}
