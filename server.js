import express from "express";
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cloudConnection from "./config/cloudinaryConfig.js";
import mongooseConnection from "./config/mongoosConfig.js";
const app = express();
cloudConnection();
mongooseConnection();
app.listen(process.env.PORT || 4000, () => {
  console.log("listening on port ", process.env.PORT || 4000);
});
