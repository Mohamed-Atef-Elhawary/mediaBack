import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    helpfulVotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    },
    createdAt: {
      type: String,
    },
  },
  {
    minimize: false,
  },
);
reviewSchema.index({ userId: 1, docId: 1 }, { unique: true });
const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
