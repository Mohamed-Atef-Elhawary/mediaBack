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
  authUser,
  upload.single("image"),
  userController.updateProfile,
);
userRouter.post("/book", authUser, userController.bookAppointment);
userRouter.get("/appointment", authUser, userController.appointmentsList);
userRouter.get("/cancel", authUser, userController.cancelAppointment);

userRouter.post("/pay", authUser, userController.paymentPaymob);
// رابط الـ Webhook (بايموب بيبعت عليه نتيجة الدفع للسيرفر)
userRouter.post("/paymob-webhook", userController.paymobWebhook);

// رابط الـ Response (بايموب بيرجع اليوزر عليه بعد ما يخلص)
userRouter.get("/paymob-response", userController.paymobResponse);

// userRouter.get("/veriy", authUser, userController.verifyPayment);

export default userRouter;
