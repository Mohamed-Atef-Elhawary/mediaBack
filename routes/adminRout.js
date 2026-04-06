import express from "express";
import authAdmin from "../middleWares/authAdmin.js";
import { adminController } from "../controllers/adminController.js";

const adminRouter = express.Router();
adminRouter.post("/login", adminController.login);
adminRouter.post("/add", authAdmin, adminController.addDoctor);
adminRouter.get("/doctorlist", authAdmin, adminController.doctorsList);
adminRouter.get(
  "/appointmentlist",
  authAdmin,
  adminController.appointmentsList,
);
adminRouter.get("/cancel", authAdmin, adminController.cancelAppointment);
adminRouter.get("/dashboard", authAdmin, adminController.adminDashboard);

export default adminRouter;
