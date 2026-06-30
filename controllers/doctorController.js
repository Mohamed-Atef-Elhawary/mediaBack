import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    const passwordCompare = await bcrypt.compare(password, doctor.password);

    if (!passwordCompare) {
      return res.json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWTSECRET);
    const image = doctor.image;
    const name = doctor.name;

    return res.json({
      success: true,
      message: "Login Succeeded",
      data: { token, image, name },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message, data: null });
  }
};
const getProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const doctor = await doctorModel.findById(docId).select("-password");
    if (!doctor) {
      return res.json({
        success: false,
        message: "Doctor does not exist",
        data: null,
      });
    }

    return res.json({
      success: true,
      message: "doctor profile fetched successfully",
      data: doctor,
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
    const { docId, consultationFee, address, available } = req.body;
    const imgFile = req.file;
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({
        success: false,
        message: "Doctor not found",
        data: null,
      });
    }
    if (imgFile) {
      const uploadedImg = await cloudinary.uploader.upload(imgFile.path, {
        resource_type: "image",
      });
      doctor.image = uploadedImg.secure_url;
    }
    doctor.consultationFee = Number(consultationFee);
    doctor.address = JSON.parse(address);
    doctor.available = available === "true";
    await doctor.save();
    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const doctor = async (req, res) => {
  try {
    let docId = req.params.docId;
    const doctor = await doctorModel
      .findById(docId)
      .select(["-password", "-email", "-__v"]);
    if (!doctor) {
      return res.json({
        success: false,
        message: "No  doctors found",
        data: null,
      });
    }
    res.json({
      success: true,
      message: "Doctor is fount",
      data: doctor,
    });
  } catch (error) {
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
      .select(["-password", "-email", "-__v"]);

    return res.json({
      success: true,
      message: doctors.length ? "All doctors" : "No  doctors found",
      data: doctors,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

//Appointments  media manager
const doctorAppointments = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    return res.json({
      success: true,
      message: appointments.length
        ? "All appointments"
        : "No  appointments found",
      data: appointments,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (
      !appointment ||
      appointment.cancelled ||
      String(appointment.docId) !== String(docId)
    ) {
      return res.json({
        success: false,
        message: "Appointment can not be completed or access denied",
        data: null,
      });
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
    });
    res.json({
      success: true,
      message: "Appointment completed successfully",
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

const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const doctor = await doctorModel.findById(docId).select("-password");
    const appointments = await appointmentModel.find({
      docId,
      isCompleted: true,
    });

    let patients = new Set();
    appointments.forEach((appointment) => {
      patients.add(appointment.userId);
    });

    let money = doctor.consultationFee * appointments.length;
    const data = {
      money,
      numberOfAppointments: appointments.length,
      numberOfPatients: patients.size,
      completedAppointments: appointments.reverse(),
    };
    res.json({
      success: true,
      message: "Doctor dashboard data",
      data,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const doctorController = {
  login,
  getProfile,
  updateProfile,
  doctorsList,
  doctor,
  doctorAppointments,
  completeAppointment,
  doctorDashboard,
};
