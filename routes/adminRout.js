import express from "express";
import authAdmin from "../middleWares/authAdmin.js";
import { adminController } from "../controllers/adminController.js";
import upload from "../middleWares/multer.js";
const adminRouter = express.Router();
adminRouter.post("/login", adminController.login);
adminRouter.post(
  "/add",
  upload.single("image"),
  authAdmin,
  adminController.addDoctor,
);
adminRouter.get("/doctorlist", authAdmin, adminController.doctorsList);
adminRouter.get(
  "/appointmentlist",
  authAdmin,
  adminController.appointmentsList,
);
adminRouter.post("/cancel", authAdmin, adminController.cancelAppointment);
adminRouter.post("/complete", authAdmin, adminController.completeAppointment);
adminRouter.get("/dashboard", authAdmin, adminController.adminDashboard);

export default adminRouter;
