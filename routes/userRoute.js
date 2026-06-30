import express from "express";
import { userController } from "../controllers/userController.js";
import authUser from "../middleWares/authUser.js";
import upload from "../middleWares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.get("/profile", authUser, userController.getProfile);

userRouter.post(
  "/update",
  upload.single("image"),
  authUser,
  userController.updateProfile,
);
userRouter.post("/book", authUser, userController.bookAppointment);
userRouter.get("/appointments", authUser, userController.appointmentsList);
userRouter.post("/cancel", authUser, userController.cancelAppointment);

export default userRouter;
