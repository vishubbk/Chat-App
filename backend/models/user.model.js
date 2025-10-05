import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ⚙️ userSchema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minLength: [4, "Email must be at least 4 characters long"],
    maxLength: [40, "Email must be at most 40 characters long"], // ✅ fixed typo
  },
  password: { type: String, required: true },
   projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "project"
  }]
});

// ⚙️ Hash password (static method)
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// ⚙️ Check password (instance method instead of static)
userSchema.statics.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ⚙️ Generate JWT (instance method)
userSchema.statics.generateJWT = function () {
  return jwt.sign(
    { email: this.email, id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" } 
  );
};

const User = mongoose.model("User", userSchema);

export default User;
