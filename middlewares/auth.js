const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. Invalid token format." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden. Admins only." });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden. Admins only." });
  }
}

function isUserOrAdmin(req, res, next) {
  const userId = req.params.id || req.user.id;
  if (req.user.role === "admin" || req.user.id === userId) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden. Not authorized." });
  }
}

module.exports = {
  verifyToken,
  isAdmin,
  isUserOrAdmin,
};
