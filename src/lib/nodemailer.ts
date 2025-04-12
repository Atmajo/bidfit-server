import nodemailer from "nodemailer";
import { envs } from "../config";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: envs.smtp.user,
    pass: envs.smtp.pass,
  },
});
