import { Request, Response } from "express";
import { readdir } from "fs/promises";

export const imageUploader = async (req: Request, res: Response) => {
  console.log("> Image upload request received");
  try {
    const file = req.file;

    if (!file) {
      res.status(400).send({ message: "No file uploaded" });
      return;
    }

    const files = await readdir("public");

    res.status(200).send({
      message: "Image uploaded successfully",
      url: `/${files[files.length - 1]}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};
