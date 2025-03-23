import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { db } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (!user) {
      res.status(500).send({ message: `An error while creating user` });
    }

    res.status(201).send({ message: "User created successfully" });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send({ message: `An error occurred` });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("> login");
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).send({ message: `User not found` });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).send({ message: `Invalid password` });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });

    const cookieOptions = {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      Secure: true,
      SameSite: "None"
    };

    res.cookie("token", token, cookieOptions);
    res.send({ message: "Logged in successfully" });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send({ message: `An error occurred` });
  }
};
