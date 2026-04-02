import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dmyfciqzs/image/upload/v1774955804/userImage_2r8paw2r8paw2r8p.png_yg7miu.png",
    },
    address: {
      type: Object,
      default: {
        line1: "",
        line2: "",
      },
    },
    gender: {
      type: String,
      default: "Not Selected",
    },
    dateOfBirth: {
      type: String,
      default: "2000",
    },
    phone: {
      type: String,
      default: "00000000000",
    },
  },
  { minimize: false },
);
const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
