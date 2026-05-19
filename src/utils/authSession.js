import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "pawberry_session";

const isProduction = process.env.NODE_ENV === "production";
const sessionMaxAgeMs = 1000 * 60 * 60 * 24 * 7;

function getJwtSecret() {
  return process.env.JWT_SECRET || "pawberry-dev-secret-change-me";
}

export function signSession(user) {
  return jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function setSessionCookie(res, user) {
  res.cookie(AUTH_COOKIE_NAME, signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: sessionMaxAgeMs,
    path: "/"
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/"
  });
}
