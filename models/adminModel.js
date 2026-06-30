import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  Image: {
    type: String,
    default:
      "https://res.cloudinary.com/dmyfciqzs/image/upload/v1776779486/admin2_hzhiwx.png",
  },
});
const adminModel =
  mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
