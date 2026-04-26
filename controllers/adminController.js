import validator from "validator";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: "Missing data", data: null });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
        data: null,
      });
    }

    if (
      email !== process.env.ADMINEMAIL ||
      password !== process.env.ADMINPASSWORD
    ) {
      return res.json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }
    const token = jwt.sign({ id: email }, process.env.JWTSECRET);
    const image = process.env.ADMINIMAGE;
    res.json({
      success: true,
      message: "Login Succeeded",
      data: { token, image },
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

const addDoctor = async (req, res) => {
  try {
    console.log(req.body);
    const {
      name,
      email,
      password,
      speciality,
      experience,
      degree,
      consultationFee,
      address,
      about,
    } = req.body;
    const imgFile = req.file;
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !consultationFee ||
      !experience ||
      !about ||
      !address
    ) {
      return res.json({ success: false, message: "Missing data", data: null });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
        data: null,
      });
    }
    const exists = await doctorModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "Doctor already exists",
        data: null,
      });
    }

    if (String(password).trim().length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password).trim(), salt);
    const docData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      about,
      experience,
      consultationFee,
      date: Date.now(),
      address: JSON.parse(address),
    };
    console.log("imgFile", imgFile);
    if (imgFile) {
      const uploaded = await cloudinary.uploader.upload(imgFile.path, {
        resource_type: "image",
      });
      docData.image = uploaded.secure_url;
    }
    const newDoctor = new doctorModel(docData);
    await newDoctor.save();
    res.json({
      success: true,
      message: "Doctor added successfully",
      data: null,
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
const doctorsList = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select("-password -email -imagePublicId");

    return res.json({
      success: true,
      message: doctors.length ? "All doctors" : "No  doctors found",
      data: doctors,
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
const appointmentsList = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({
      success: true,
      message: "Appointments list",
      data: appointments,
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

const cancelAppointment = async (req, res) => {
  console.log("red.body", req.body);
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.json({
        success: false,
        message: "Missing data",
        data: null,
      });
    }
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found",
        data: null,
      });
    }
    if (appointment.isPaid || appointment.isCompleted) {
      return res.json({
        success: false,
        message: "Appointment can not be cancelled",
        data: null,
      });
    }
    const appointmentDate = appointment.appointmentDate;
    const appointmentTime = appointment.appointmentTime;

    const docId = appointment.docId;
    const doctor = await doctorModel.findById(docId);
    const appointmentBooked = doctor.appointmentBooked;
    if (!appointmentBooked[appointmentDate]) {
      return res.json({
        success: false,
        message: "Appointment can not be cancelled",
        data: null,
      });
    }
    appointmentBooked[appointmentDate] = appointmentBooked[
      appointmentDate
    ].filter((time) => time !== appointmentTime);
    doctor.appointmentBooked = appointmentBooked;

    await doctor.save();

    appointment.cancelled = true;
    await appointment.save();
    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: null,
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
const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.json({
        success: false,
        message: "Missing data",
        data: null,
      });
    }
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found",
        data: null,
      });
    }
    if (appointment.cancelled) {
      return res.json({
        success: false,
        message: "Appointment cancelled",
        data: null,
      });
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
    });
    res.json({
      success: true,
      message: "Appointment completed",
      data: null,
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
const adminDashboard = async (req, res) => {
  try {
    const users = await userModel.find({});
    const doctors = await doctorModel.find({});
    const appointments = await appointmentModel.find({});
    const data = {
      numberOfAppointments: appointments.length,
      numberOdDoctors: doctors.length,
      numberOfPatients: users.length,
      latestAppointments: appointments.reverse(),
    };
    res.json({
      success: true,
      message: "Admin dashboard data",
      data,
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
export const adminController = {
  login,
  addDoctor,
  doctorsList,
  appointmentsList,
  cancelAppointment,
  completeAppointment,
  adminDashboard,
};
