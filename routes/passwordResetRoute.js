import express from "express";
import { passwordResetController } from "../controllers/passwordResetController.js";
const passwordResetRouter = express.Router();
passwordResetRouter.post(
  "/request",
  passwordResetController.requestPasswordReset,
);
passwordResetRouter.post("/reset", passwordResetController.resetPassword);
export default passwordResetRouter;
