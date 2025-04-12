import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { db } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from "../lib/redis";
import { producer } from "../lib/intitialize-services";
import { User } from "@prisma/client";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(409).send({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    await producer.send({
      topic: "user-registration",
      messages: [
        {
          key: email,
          value: JSON.stringify(userData),
        },
      ],
    });

    res.status(202).send({
      message: "User Registered",
    });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send({ message: `An error occurred` });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    let user: User | null;
    
    const cachedUser = await redisClient.get(`user:${email}`);
    
    if (cachedUser !== null) {
      user = JSON.parse(cachedUser);
    } else {
      user = await db.user.findUnique({
        where: {
          email,
        },
      });
    }

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
    };

    res.cookie("token", token, cookieOptions);
    res.send({ message: "Logged in successfully", token: token });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send({ message: `An error occurred` });
  }
};
