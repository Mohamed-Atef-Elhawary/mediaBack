import mongoose from "mongoose";
const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
    required: true,
  },
});

const passwordResetModel =
  mongoose.models.passwordreset ||
  mongoose.model("passwordreset", passwordResetSchema);
export default passwordResetModel;
