import imagekit from "../config/imagekit.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import crypto from "crypto"
dotenv.config()
const createToken = (userId)=>
{
  return jwt.sign({id : userId} , process.env.JWT_SECRET , {expiresIn: process.env.TWT_EXPIRY})

}
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

    // ✅ create user FIRST
    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarUrl,
    });

    // ✅ create token AFTER user exists
    const token = createToken(user._id);

    // ✅ single response
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
    console.error("signup not successfully", error);
    return res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try{
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(404)
      .json({ message: "both email and password  are required" });
      
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ message: "Email Id doesn't exist" });
  }

  const isMatch =  await user.comparePassword(password);
  if(!isMatch)
  {
    return res.status(400).json({message:"Invalid email id or password"})
  }

  res.status(200).json({message:"user logged in scucessfully"})
}catch(err)
{
  console.error("login not successfull", err.message)
  res.status(500).json({message:"server error"})
}
};

const getMe = async (req,res)=>
{
  if(!req.user)
  res.status(401).json({message:"not authenticated"})
  else
  res.status(200).json(req.user)

}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user Found" });

    // Generated a token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpires= Date.now()+10*60*1000;

    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-passeord/${resetToken}`;
  } catch (error) {}
};

export { signup, login , getMe };
