import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema(
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
        "https://res.cloudinary.com/dmyfciqzs/image/upload/v1774957511/doctorImage_Image_vmips5vmips5vmip.png_qecjyv.png",
    },
    imagePublicId: {
      type: String,
    },
    speciality: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
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
    appointmentBooked: {
      type: Object,
      default: {},
    },
    rank: { type: Number, default: 0 },
    totalReviewers: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  {
    minimize: false,
  },
);
const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
