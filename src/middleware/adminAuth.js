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

export function requireAdminAuth(req, res, next) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return unauthorized(res);
  }

  const credentials = readBasicCredentials(req.get("authorization"));
  if (credentials?.username !== expectedUsername || credentials?.password !== expectedPassword) {
    return unauthorized(res);
  }

  return next();
}
