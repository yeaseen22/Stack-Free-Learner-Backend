import { Request, Response } from "express";
import { User } from "../../models/auth/UserModel";
import { comparePassword, hashPassword } from "../../utils/hashPassword";
import { trackDevice } from "../../helpers/deviceTracker";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt";
import { Enrollment } from "../../models/course/EnrollmentModel";
import { getAllProfileLevels } from "../../helpers/getProfileTypeWithUnlock";
import { generateSecureUserId } from "../../helpers/generateSecureUserId";

// register student
export const registerStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password, 10);
    const userId = generateSecureUserId("student");

    const newUser = new User({
      userId,
      name,
      email,
      role: "student",
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Student registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        userId: newUser.userId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Student registration failed", error });
  }
};

// VIP Student registration (admin-managed)
export const registerVipStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password, 10);
    const userId = generateSecureUserId("vipstudent");

    const newUser = new User({
      userId,
      name,
      email,
      role: "student",
      isVipStudent: true,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "VIP Student registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVipStudent: newUser.isVipStudent,
        userId: newUser.userId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "VIP Student registration failed", error });
  }
};

// Admin registration
export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password, 10);
    const userId = generateSecureUserId("admin");

    const newUser = new User({
      userId,
      name,
      email,
      role: "admin",
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        userId: newUser.userId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Admin registration failed", error });
  }
};

// Instructor registration
export const registerInstructor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, email, password, specialization, qualifications } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password, 10);
    const userId = generateSecureUserId("instructor");

    const newUser = new User({
      userId,
      name,
      email,
      role: "instructor",
      password: hashedPassword,
      specialization,
      qualifications,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Instructor registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        userId: newUser.userId,
        specialization: newUser.specialization,
        qualifications: newUser.qualifications,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Instructor registration failed", error });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //device tracking
    if (user?._id) {
      trackDevice(user._id.toString(), req);
    }

    // Create user payload
    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role ?? "",
    };

    // Generate token
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Return response
    return res.status(201).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVipStudent: user.isVipStudent,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Login failed", error });
  }
};

export const refresh = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  const decoded = verifyToken(refreshToken, "refresh");

  if (!decoded) {
    res.status(403).json({
      message: "Invalid or expired refresh token. Please log in again.",
    });
    return;
  }

  // Generate a new access token
  const newAccessToken = generateAccessToken({
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({ message: "Access token refreshed" });
};

export const logout = (req: Request, res: Response): void => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};
