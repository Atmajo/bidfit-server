import { Request, Response } from "express";
import { db } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/middleware";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany();
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send(`An error occurred`);
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.user?.id;

    if (!id) {
      res.status(404).send("Authorization failed");
      return;
    }

    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      res.status(404).send(`User not found`);
      return;
    }

    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send(`An error occurred`);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.user?.id;
    
    if (!id) {
      res.status(404).send("Authorization failed");
      return;
    }

    const { name, email, image, role } = req.body;

    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      res.status(404).send(`User not found`);
      return;
    }

    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        name: name || user.name,
        email: email || user.email,
        image: image || user.image,
        role: role || user.role,
      },
    });

    if (!updatedUser) {
      res.status(500).send(`An error while updating user`);
    }

    res.status(200).send("User updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send(`An error occurred`);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.user?.id;
    
    if (!id) {
      res.status(404).send("Authorization failed");
      return;
    }

    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      res.status(404).send(`User not found`);
      return;
    }

    await db.user.delete({
      where: {
        id,
      },
    });

    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send(`An error occurred`);
  }
};
