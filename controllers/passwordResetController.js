import validator from "validator";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import passwordResetModel from "../models/passwordReset.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({
        success: false,
        message: "Missing data",
        data: null,
      });
    } else if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "invalid email",
        data: null,
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
        data: null,
      });
    }
    const token = jwt.sign({ userEmail: email }, process.env.JWTSECRET);
    const passwordResetData = {
      token,
      userId: user._id,
    };
    const newPasswordReset = new passwordResetModel(passwordResetData);
    await newPasswordReset.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APPUSER,
        pass: process.env.APPPASSWORD,
      },
    });
    const resetLink = `http://localhost:4200/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.APPUSER,
      to: email,
      subject: "MediFlow - Password Reset Request",
      html: `
        <h3>Hello</h3>
        <p>you requested to reset your password for your MediaFlow account</p>
        <p>Please click the link below to set a new password. This link is valid for 10 minutes:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Password reset link sent to your email.",
      data: null,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.json({
        success: false,
        message: "Missing data",
        data: null,
      });
    }
    const passwordResetData = await passwordResetModel.findOne({ token });
    if (!passwordResetData) {
      return res.json({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await userModel.findById(passwordResetData.userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
        data: null,
      });
    }
    user.password = hashedPassword;
    await user.save();
    await passwordResetModel.deleteOne({ _id: passwordResetData._id });

    const userToken = jwt.sign({ id: user._id }, process.env.JWTSECRET);

    return res.json({
      success: true,
      message: "Password reset successfully",
      data: {
        token: userToken,
        image: user.image,
        name: user.name,
        id: user._id,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
export const passwordResetController = {
  requestPasswordReset,
  resetPassword,
};
