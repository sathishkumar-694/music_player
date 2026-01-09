import imagekit from "../config/imagekit.js";
import User from "../models/userModel.js";

const signup = async (req, res) => {
  try {
    console.log(req);
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exitstingUser = await User.findOne({ email: email });
    if (exitstingUser) {
      return res.status(400).json({ message: "EmailId already exits" });
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
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
    console.log(data);
    res.status(200).json({ message: "function runs correctly" });
  } catch (error) {
    console.error("signup not successfully");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(404)
      .json({ message: "both email and password  are required" });
      
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ message: "Email Id doesn't exist" });
  }
};
export { signup, login };
