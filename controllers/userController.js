import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
//API for register

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing data", data: null });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
        data: null,
      });
    }
    if (password.trim().length < 8) {
      return res.json({
        success: false,
        message: "Please enter a  strong password",
        data: null,
      });
    }
    //password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userData = {
      name,
      email,
      password: hashedPassword,
    };
    const newUser = new userModel(userData);
    const user = await newUser.save();

    //generate token
    const token = jwt.sign({ id: user._id }, process.env.JWTSECRET);
    if (token) {
      return res.json({
        success: true,
        message: "Rejester Successded",
        data: token,
      });
    } else {
      return res.json({
        success: false,
        message: "Rejester Faild",
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message, data: null });
  }
};

export const userController = {
  register,
};
