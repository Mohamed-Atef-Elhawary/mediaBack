import express from "express";
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cloudConnection from "./config/cloudinaryConfig.js";
import mongooseConnection from "./config/mongoosConfig.js";
import crypto from "crypto";

import userRouter from "./routes/userRoute.js";
import docRouter from "./routes/docRoute.js";
import adminRouter from "./routes/adminRout.js";
import reviewRouter from "./routes/reviewRout.js";
import passwordResetRouter from "./routes/passwordResetRoute.js";

const app = express();
app.use(express.json());
app.use(cors());

cloudConnection();
mongooseConnection();
app.use("/api/user", userRouter);
app.use("/api/doctor", docRouter);
app.use("/api/admin", adminRouter);
app.use("/api/review", reviewRouter);
app.use("/api/password", passwordResetRouter);

app.listen(process.env.PORT || 4000, () => {
  console.log("listening on port ", process.env.PORT || 4000);
});
