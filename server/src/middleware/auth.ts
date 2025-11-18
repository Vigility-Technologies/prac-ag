import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: "admin" | "member";
    };

    (req as unknown as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as unknown as AuthRequest;
  if (authReq.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
