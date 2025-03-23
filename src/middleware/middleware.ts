import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envs } from "../config";

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authmiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.cookie
    ? req.headers.cookie.split(";")[0].split("=")[1]
    : null;

  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const decoded = jwt.verify(token, envs.jwtsecret) as jwt.JwtPayload & {
      userId: string;
    };

    if (!decoded) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    
    (req as any).user = { ...decoded, id: decoded.userId };
    next();
  } catch (err) {
    console.error("Token authentication error:", err);
    res.status(403).json({ error: "Invalid token" });
  }
};
