import * as nodemailer from "nodemailer";
import { Server } from "socket.io";

export const sendSignupEmail = async (
  email: string,
  role: string,
  name: string,
  tempToken: string
) => {
  const signupLink = `${process.env.FRONT_END_URL_SIGNUP}?token=${tempToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER || "company",
    to: email,
    subject: "Welcome to [Fcode-labs]",
    html: `
      <p>Dear ${name || "User"},</p>
      <p>You have been added as an ${role} to our system. Please click the following link to create your password and access your account:</p>
      <a href="${signupLink}">${signupLink}</a>
      <p>Please note that the password creation link is valid for one-time use only. Ensure that you use it promptly to set up your password.</p>
      <p>Best regards,</p>
      <p>[Fcode-labs]</p>
    `,
  };

  return new Promise<void>((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve();
      }
    });
  });
};

export async function sendMessage(
  io: Server,
  userId: string,
  message: string,
  data: string
) {
  if (userId) {
    console.log("Sending message to user:", userId, message);
    io.to(userId).emit(message, data);
  } else {
    console.warn("User not found:", userId);
  }
}
