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

    //generate token
    const token = jwt.sign({ id: doctor._id }, process.env.JWTSECRET);
    const image = doctor.image;
    const name = doctor.name;

    return res.json({
      success: true,
      message: "Login Succeeded",
      data: { token, image, name },
    });
  } catch (error) {
    console.log(error);
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
      if (doctor.imagePublicId) {
        await cloudinary.uploader.destroy(doctor.imagePublicId);
      }
      const uploadedImg = await cloudinary.uploader.upload(imgFile.path, {
        resource_type: "image",
      });
      doctor.image = uploadedImg.secure_url;
      doctor.imagePublicId = uploadedImg.public_id;
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
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
// const changeAvailability = async (req, res) => {
//   try {
//     const { docId } = req.body;

//     const updatedDoc = await doctorModel.findByIdAndUpdate(
//       docId,
//       [{ $set: { available: { $not: "$available" } } }],
//       { new: true },
//     );

//     if (!updatedDoc) {
//       return res.json({
//         success: false,
//         message: "Doctor not found",
//         data: null,
//       });
//     }
//     res.json({
//       success: true,
//       message: "Availability changed correctly",
//       data: updatedDoc.available,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: error.message,
//       data: null,
//     });
//   }
// };
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
      // .find({ available: true })
      .find({})
      .select(["-password", "-email", "-__v"]);

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

//Appointments for doctor panel
//for media manager

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
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
//for media manager

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
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
//for media manager

const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const { appointmentId, docId } = req.body;
    const appointment = await appointmentModel
      .findById(appointmentId)
      .session(session);
    const doctor = await doctorModel.findById(docId).session(session);
    if (
      !appointment ||
      !doctor ||
      String(appointment.docId) !== String(docId)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        success: false,
        message: "Appointment not found or access denied",
        data: null,
      });
    }
    if (appointment.isPaid || appointment.isCompleted) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        success: false,
        message: "Appointment can not be cancelled",
        data: null,
      });
    }

    let appointmentDate =
      doctor.appointmentBooked[appointment.appointmentDate] || [];
    appointmentDate = appointmentDate.filter(
      (time) => time !== appointment.appointmentTime,
    );

    doctor.appointmentBooked[appointment.appointmentDate] = appointmentDate;
    appointment.cancelled = true;
    await doctor.save({ session });
    await appointment.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: null,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

//for media manager
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const doctor = await doctorModel.findById(docId).select("-password");
    const appointments = await appointmentModel.find({
      docId,
      isCompleted: true,
    });

    // let patients=[];
    // appointments.forEach(appointment=>{
    //     if (!patients.includes(appointment.userId)) {
    //         patients.push(appointment.userId)
    //     }
    // })

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
    console.log(error);
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
  // changeAvailability,
  doctorsList,
  doctor,
  doctorAppointments,
  completeAppointment,
  cancelAppointment,
  doctorDashboard,
};

//  try {

//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: error.message,
//       data: null,

//   })}
