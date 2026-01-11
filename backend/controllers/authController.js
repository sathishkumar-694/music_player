import imagekit from "../config/imagekit.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import sendMail from "../utils/emailSender.js";

dotenv.config();

/* =======================
   JWT TOKEN CREATOR
======================= */
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

/* =======================
   SIGNUP
======================= */
const signup = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let avatarUrl = "";
    if (avatar) {
      const uploadResponse = await imagekit.upload({
        file: avatar,
        filename: `avatar_${Date.now()}`,
        folder: "/music_player",
      });
      avatarUrl = uploadResponse.url;
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarUrl,
    });

    const token = createToken(user._id);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("signup error", error.message);
    return res.status(500).json({ message: "Signup failed" });
  }
};

/* =======================
   LOGIN
======================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Both email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    console.error("login error", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   GET LOGGED-IN USER
======================= */
const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.status(200).json(req.user);
};

/* =======================
   FORGOT PASSWORD
======================= */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    // generate RAW token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });

    return res
      .status(200)
      .json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("forgot password error", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* =======================
   RESET PASSWORD
======================= */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("reset password error", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const editProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "not authenicated" });
    }
    const { name, email, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (name) user.name = name;
    if (email) user.email = email;

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "both the current and new pass required",
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "current pass is incorrect" });
      }
      if (newPassword.length < 6)
        return res
          .status(400)
          .json({ message: "password len should be atleast 6 characters" });
      user.password = newPassword;
    }

    if (avatar) {
      const uploadResponse = await imagekit.upload({
        file: avatar,
        fileName: `avatar_${userId}_${Date.now()}.jpg`,
        folder: "/music-player",
      });
      user.avatar = uploadResponse.url;
    }
    await user.save();
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("edit profile error", error.message);
    return res.status(500).json({ message: "error in updating profile" });
  }
};
/* =======================
   EXPORTS
======================= */
export { signup, login, getMe, forgotPassword, resetPassword, editProfile };
