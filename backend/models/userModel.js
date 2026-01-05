import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "required fields"],
  },

  email: {
    type: String,
    required: [true, "required"],
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, "required"],
    minLength: 6,
  },

  avatar : {
    type : String ,
    default : " ",

  }
});
const User = mongoose.model("User" , userSchema);

export default User;