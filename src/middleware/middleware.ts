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
    ? req.headers.cookie.split(";")[1].split("=")[1]
    : null;
  
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  console.log("Token:", token);
  
  try {
    const decoded = jwt.verify(token, envs.jwtsecret) as jwt.JwtPayload & {
      userId: string;
    };

    console.log("Decoded token:", decoded);

    if (!decoded) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      res.status(403).json({ error: "Token expired" });
      return;
    }
    
    (req as any).user = { ...decoded, id: decoded.userId };
    next();
  } catch (err) {
    console.error("Token authentication error:", err);
    res.status(403).json({ error: "Invalid token" });
  }
};
