import express from "express";
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cloudConnection from "./config/cloudinaryConfig.js";
import mongooseConnection from "./config/mongoosConfig.js";
import crypto from "crypto";

import userRouter from "./routes/userRoute.js";
const app = express();
app.use(express.json());
app.use(cors());

cloudConnection();
mongooseConnection();
app.use("/api/user", userRouter);
app.get("/", (req, res) => {
  res.send("app works");
});
app.listen(process.env.PORT || 4000, () => {
  //get secret
  // console.log(crypto.randomBytes(64).toString("hex"));
  console.log("listening on port ", process.env.PORT || 4000);
});
