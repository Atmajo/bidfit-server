import { User } from "@prisma/client";
import { envs } from "../config";
import { transporter } from "../lib/nodemailer";
import { db } from "../lib/prisma";
import { redisClient } from "../lib/redis";
import { producer } from "../lib/intitialize-services";

export async function userRegistration(data: User) {
  try {
    const user = await db.user.create({
      data: data,
    });

    if (!user) {
      console.error("User registration failed");
      return;
    }

    // Cache user data with a 24-hour expiration
    await cacheUserData(user);
    
    // Send welcome email
    const emailData = {
      email: data.email,
      name: data.name,
      body: `<h1>Welcome, ${data.name}!</h1>
            <p>Thank you for registering with us. We're excited to have you on board.</p>
            <p>Best regards,<br>Your Team</p>`,
    };

    await producer.send({
      topic: "notification",
      messages: [
        {
          key: data.email,
          value: JSON.stringify(emailData),
        },
      ],
    });
  } catch (error) {
    console.error("User registration failed:", error);
  }
}

export async function sendEmail(data: {
  name: string;
  email: string;
  body: string;
}) {
  try {
    const mailOptions = {
      from: `Atmajo Chowdhury <${envs.smtp.user}>`,
      to: data.email,
      subject: "Welcome to Our Platform!",
      html: data.body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${data.email}`);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}

export async function cacheUserData(userData: User) {
  try {
    console.log("User data to cache:", userData);
    
    if (!userData) {
      console.error("No user data to cache");
      return;
    }

    // Cache user data with a 24-hour expiration
    await redisClient.set(`user:${userData.email}`, JSON.stringify(userData), {
      EX: 600,
    });

    console.log(`User ${userData.id} cached in Redis`);
  } catch (error) {
    console.error("Redis caching failed:", error);
  }
}
