import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
