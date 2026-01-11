import mongoose from "mongoose";
import bcrypt from "bcrypt";
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

  avatar: {
    type: String,
    default: " ",
  },
  resetPasswordToken: { type: String },
  resetPasswordTokenExpire: {
    type: Date,
  },
  favourites:[{
    id:
    {
      type: String , 
      required:true
    },
    name :String , 
    artist_name : String , 
    image : String ,
    duration :String,
    audio:String
  },
],
});
//pre saving function for password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
