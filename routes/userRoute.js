import express from "express";
import { userController } from "../controllers/userController.js";
import authUser from "../middleWares/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.get("/profile", authUser, userController.getProfile);
userRouter.post("/update", authUser, userController.updateProfile);

export default userRouter;
