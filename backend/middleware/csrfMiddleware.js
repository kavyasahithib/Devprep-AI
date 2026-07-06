/**
 * CSRF Protection Middleware
 * Verifies that the Origin or Referer of state-changing HTTP requests
 * matches the allowed frontend origin to block cross-site request forgery.
 */
module.exports = (req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

  // 1. Origin header check (standard browser behavior for POST/PUT/DELETE)
  if (origin && origin !== allowedOrigin) {
    console.warn(`[CSRF Alert] Rejected request from invalid origin: ${origin}`);
    return res.status(403).json({ message: "CSRF protection: Invalid origin" });
  }

  // 2. Referer header fallback check (if Origin header is missing)
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      const allowedUrl = new URL(allowedOrigin);
      if (refererUrl.origin !== allowedUrl.origin) {
        console.warn(`[CSRF Alert] Rejected request from invalid referer: ${refererUrl.origin}`);
        return res.status(403).json({ message: "CSRF protection: Invalid referer origin" });
      }
    } catch (e) {
      console.warn(`[CSRF Alert] Rejected request due to malformed referer: ${referer}`);
      return res.status(403).json({ message: "CSRF protection: Malformed referer" });
    }
  }

  next();
};
