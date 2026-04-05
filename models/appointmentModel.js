import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    required: true,
  },

  appointmentDate: {
    type: String,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
  docData: {
    type: Object,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },

  isPaid: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  paymentOrderId: {
    type: String,
    default: "",
  },
});
const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);
export default appointmentModel;
