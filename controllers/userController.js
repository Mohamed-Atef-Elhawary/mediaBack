import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import axios from "axios";

const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;
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
    password = String(password);
    if (password.trim().length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
        data: null,
      });
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const userData = {
      name,
      email,
      password: hashedPassword,
    };
    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWTSECRET);

    res.json({
      success: true,
      message: "Register Successful",
      data: { token, image: user.image, name: user.name, id: user._id },
    });
  } catch (error) {
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

    const token = jwt.sign({ id: user._id }, process.env.JWTSECRET);

    return res.json({
      success: true,
      message: "Login Successfull",
      data: { token, image: user.image, name: user.name, id: user._id },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message, data: null });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel
      .findById(userId)
      .select("name email image gender dateOfBirth phone address");
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
      return res.json({
        success: false,
        message: "User not found",
        data: null,
      });
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
      image: user.image,
      _id: user._id,
    };
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: userData,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, appointmentDate, appointmentTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData || !docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available",
        data: null,
      });
    }

    let appointmentBooked = docData.appointmentBooked || {};
    if (appointmentBooked[appointmentDate]) {
      if (appointmentBooked[appointmentDate].includes(appointmentTime)) {
        return res.json({
          success: false,
          message: "Appointment time is not available",
          data: null,
        });
      } else {
        appointmentBooked[appointmentDate].push(appointmentTime);
      }
    } else {
      appointmentBooked[appointmentDate] = [appointmentTime];
    }
    const userData = await userModel.findById(userId).select("-password");
    const docInfo = docData.toObject();
    delete docInfo.appointmentBooked;

    const appointmentData = {
      userId,
      docId,
      appointmentDate,
      appointmentTime,
      userData,
      docData: docInfo,
      price: docInfo.consultationFee,
      date: Date.now(),
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { appointmentBooked });
    res.json({
      success: true,
      message: "Appointment booked Succeeded",
      data: newAppointment,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const appointmentsList = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({
      userId,
      cancelled: false,
    });
    if (!appointments.length) {
      return res.json({
        success: true,
        message: "No appointments found",
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "All appointments",
      data: appointments.reverse(),
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({
        success: false,
        message: "No appointment to cancel",
        data: null,
      });
    }
    if (appointment.cancelled || appointment.isCompleted) {
      return res.json({
        success: false,
        message: "Appointment can not cancelled",
        data: null,
      });
    }

    appointment.cancelled = true;
    await appointment.save();

    //update doctor appointmentBooked
    const docData = await doctorModel.findById(appointment.docId);

    let appointmentBooked = docData.appointmentBooked;
    let appointmentDate = appointmentBooked[appointment.appointmentDate];

    appointmentDate = appointmentDate.filter(
      (time) => time !== appointment.appointmentTime,
    );

    appointmentBooked[appointment.appointmentDate] = appointmentDate;
    await doctorModel.findByIdAndUpdate(appointment.docId, {
      appointmentBooked,
    });

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
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

export const userController = {
  register,
  login,
  getProfile,
  updateProfile,
  bookAppointment,
  appointmentsList,
  cancelAppointment,
};
