import mongoose from "mongoose";
import { User } from "./src/models/auth/UserModel";
import { hashPassword } from "./src/utils/hashPassword";
import { generateSecureUserId } from "./src/helpers/generateSecureUserId";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const url = process.env.MONGO_URI;
    if (!url) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(url);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@stackfree.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      process.exit(0);
    }

    // Create new admin
    const hashedPassword = await hashPassword("Admin@123456", 10);
    const userId = generateSecureUserId("admin");

    const admin = new User({
      userId,
      name: "Admin User",
      email: "admin@stackfree.com",
      role: "admin",
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin created successfully!");
    console.log("Email: admin@stackfree.com");
    console.log("Password: Admin@123456");
    console.log("User ID:", admin.userId);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
