import express from "express";
import { doctorController } from "../controllers/doctorController.js";
import authDoctor from "../middleWares/authDoctor.js";
import upload from "../middleWares/multer.js";
const docRouter = express.Router();
docRouter.post("/login", doctorController.login);
docRouter.get("/profile", authDoctor, doctorController.getProfile);
docRouter.post(
  "/update",
  upload.single("image"),
  authDoctor,
  doctorController.updateProfile,
);
// docRouter.get("/available", authDoctor, doctorController.changeAvailability);
docRouter.get("/list", doctorController.doctorsList);
docRouter.get("/doctor/:docId", doctorController.doctor);
docRouter.get("/appointment", authDoctor, doctorController.doctorAppointments);
docRouter.post("/complete", authDoctor, doctorController.completeAppointment);
docRouter.post("/cancel", authDoctor, doctorController.cancelAppointment);
docRouter.get("/dashboard", authDoctor, doctorController.doctorDashboard);
export default docRouter;
