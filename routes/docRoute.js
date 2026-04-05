import express from "express";
import { doctorController } from "../controllers/doctorController.js";
import authDoctor from "../middleWares/authDoctor.js";
import upload from "../middleWares/multer.js";
const docRouter = express.Router();
docRouter.post("/login", doctorController.login);
docRouter.post("/profile", authDoctor, doctorController.login);
docRouter.post(
  "/update",
  authDoctor,
  upload.single("image"),
  doctorController.updateProfile,
);
docRouter.get("/available", authDoctor, doctorController.changeAvailability);
docRouter.get("/list", doctorController.doctorsList);
docRouter.get("/appointment", authDoctor, doctorController.doctorAppointments);
docRouter.get("/complete", authDoctor, doctorController.completeAppointment);
docRouter.get("/cancel", authDoctor, doctorController.cancelAppointment);
docRouter.get("/dashboard", authDoctor, doctorController.doctorDashboard);
export default docRouter;
