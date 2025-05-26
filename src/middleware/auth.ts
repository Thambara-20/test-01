import { Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export const authenticateToken = (req, res: Response, next: NextFunction) => {

  const token = req.cookies.accessToken;
  if (!token) {
    res.status(401).json({ error: "Access denied. Token not provided." });
    return;
  }

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token expired. Please log in again." });
      } else {
        res.status(403).json({ error: "Invalid token." });
      }
      return;
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient privileges." });
    }
    next();
  };
};
