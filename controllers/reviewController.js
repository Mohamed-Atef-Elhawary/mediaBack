import doctorModel from "../models/doctorModel";
import reviewModel from "../models/reviewModel";

const addReview = async (req, res) => {
  try {
    const { userId, docId, rating, comment } = req.body;
    if (!docId || !rating || !comment) {
      return res.json({
        success: false,
        message: "Missing Data",
        data: null,
      });
    }
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({
        success: false,
        message: "doctor not found",
        data: null,
      });
    }

    const newReview = new reviewModel({ userId, docId, rating, comment });
    await newReview.save();

    doctor.totalReviewrs = doctor.totalReviewrs + 1;
    doctor.ratingDistribution[rating] = doctor.ratingDistribution[rating] + 1;
    doctor.markModified("ratingDistribution");
    const rankOne = doctor.ratingDistribution["1"];
    const rankTwo = doctor.ratingDistribution["2"] * 2;
    const rankThree = doctor.ratingDistribution["3"] * 3;
    const rankFour = doctor.ratingDistribution["4"] * 4;
    const rankFive = doctor.ratingDistribution["5"] * 5;
    doctor.rank =
      (rankOne + rankTwo + rankThree + rankFour + rankFive) /
      doctor.totalReviewrs;
    await doctor.save();
    return res.json({
      success: true,
      message: "Review added and doctor rank updated successfully",
      data: {
        newRank: doctor.rank,
        totalReviews: doctor.totalReviewrs,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const helpfulReview = async (req, res) => {
  try {
    const { userId, reviewId } = req.body;
    if (!userId || !reviewId) {
      return res.json({
        success: false,
        message: "Missing Data",
        data: null,
      });
    }
    const review = reviewModel.findById(reviewId);
    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
        data: null,
      });
    }
    const isExists = review.helpfulVotes.includes(userId);
    if (isExists) {
      await review.findByIdAndUpdate(reviewId, {
        $pull: { helpfulVotes: userId },
      });
      return res.json({ success: true, message: "Vote removed", data: null });
    } else {
      await review.findByIdAndUpdate(reviewId, {
        $addToSet: { helpfulVotes: userId },
      });
      return res.json({ success: true, message: "Review marked as helpful" });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const reviewController = {
  addReview,
};
