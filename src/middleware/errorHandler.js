export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found.`
    }
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;

  return res.status(status).json({
    ok: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: error.message || "Unexpected server error.",
      details: error.details
    }
  });
}
