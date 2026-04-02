import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

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

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "User already exists",
        data: null,
      });
    }
    if (password.trim().length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
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
        message: "Register Succeeded",
        data: token,
      });
    } else {
      return res.json({
        success: false,
        message: "Register Failed",
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message, data: null });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Missing data", data: null });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid data", data: null });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      return res.json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    //generate token
    const token = jwt.sign({ id: user._id }, process.env.JWTSECRET);
    if (token) {
      return res.json({
        success: true,
        message: "Login Succeeded",
        data: token,
      });
    } else {
      return res.json({
        success: false,
        message: "Login Failed",
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message, data: null });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel
      .findById(userId)
      .select("name email image gender dateOfBirth phone,address");
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist",
        data: null,
      });
    }

    return res.json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, name, email, gender, dateOfBirth, phone, address } =
      req.body;
    const imgFile = req.file;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (imgFile) {
      const uploadedImg = await cloudinary.uploader.upload(imgFile.path, {
        resource_type: "image",
      });
      user.image = uploadedImg.secure_url;
    }

    user.name = name;
    user.email = email;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    user.phone = phone;
    user.address = JSON.parse(address);

    await user.save();

    await appointmentModel.updateMany(
      { userId },
      {
        $set: {
          "userData.name": name,
          "userData.email": email,
          "userData.gender": gender,
          "userData.dateOfBirth": dateOfBirth,
          "userData.phone": phone,
          "userData.address": JSON.parse(address),
          "userData.image": user.image,
        },
      },
    );
    const userData = {
      name: user.name,
      email: user.email,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      phone: user.phone,
      address: user.address,
    };
    res.json({
      success: true,
      message: "User profile updated successfully",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
export const userController = {
  register,
  login,
  getProfile,
  updateProfile,
};
