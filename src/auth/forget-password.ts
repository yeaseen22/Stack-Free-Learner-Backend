import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { sendEmail } from "../constant/email";
import { User } from "../models/auth/UserModel";




// Temporary in-memory storage (production-এ redis বা db use করো)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();


export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email } = req.body;


  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });


  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;


  otpStore.set(email, { otp, expiresAt });


  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html: `<p>Hi Fighter 👋,</p>
           <p>We received a request to reset your password for your Programming Fighter account.</p>
           <p><strong>Your OTP Code:</strong> <span style="font-size: 18px; color: #2b6cb0;">${otp}</span></p>
           <p>This code will expire in 5 minutes. If you didn't request a password reset, please ignore this email.</p>
           <p>Keep Learning & Keep Fighting! 💪</p>
           <p>— The Programming Fighter Team</p>`,
  });


  res.status(200).json({ message: "OTP sent to your email" });
};


export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
  const { email, otp } = req.body;


  const record = otpStore.get(email);
  if (!record)
    return res.status(400).json({ message: "OTP expired or not requested" });


  if (record.expiresAt < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }


  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });


  // Verified
  res.status(200).json({ message: "OTP verified" });
};


export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, newPassword } = req.body;


  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });


  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save()


  otpStore.delete(email);


  res.status(200).json({ message: "Password reset successful" });
};



