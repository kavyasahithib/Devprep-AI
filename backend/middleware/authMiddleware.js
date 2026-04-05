const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  let token;
  const authHeader = req.headers.authorization;

  // Prioritize Cookie-based tokens for and better XSS protection
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {

    // Verify token using environment variable
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    // Attach user info (id + role)
    req.user = decoded;

    next();

  } catch (error) {

    console.error("Auth error:", error.message);

    return res.status(401).json({
      message: "Invalid token"
    });

  }

};

module.exports = authMiddleware;