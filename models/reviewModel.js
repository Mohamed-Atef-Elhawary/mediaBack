import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    docId: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      defualt: "",
    },
    createdAt: {
      type: String,
    },
    helpfulVotes: {
      type: [String],
      default: [],
    },
  },
  { minimize: false },
);
const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
