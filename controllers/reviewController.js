import doctorModel from "../models/doctorModel.js";
import reviewModel from "../models/reviewModel.js";

const addReview = async (req, res) => {
  try {
    const { userId, docId, rank, comment } = req.body;
    if (!docId || !rank || !userId) {
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
    const reviewData = {
      userId,
      docId,
      rank,
      createdAt: Date.now().toString(),
    };
    if (comment) {
      reviewData.comment = comment;
    }
    const newReview = new reviewModel(reviewData);
    await newReview.save();

    doctor.totalReviewers = doctor.totalReviewers + 1;

    doctor.ratingDistribution[rank] = doctor.ratingDistribution[rank] + 1;
    doctor.markModified("ratingDistribution");
    const rankOne = doctor.ratingDistribution["1"];
    const rankTwo = doctor.ratingDistribution["2"] * 2;
    const rankThree = doctor.ratingDistribution["3"] * 3;
    const rankFour = doctor.ratingDistribution["4"] * 4;
    const rankFive = doctor.ratingDistribution["5"] * 5;

    doctor.rank =
      (rankOne + rankTwo + rankThree + rankFour + rankFive) /
      doctor.totalReviewers;
    await doctor.save();
    return res.json({
      success: true,
      message: "Review added and doctor rank updated successfully",
      data: {
        newRank: doctor.rank,
        totalReviewers: doctor.totalReviewers,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) {
      return res.json({
        success: false,
        message: "Missing Data",
        data: null,
      });
    }
    let reviews = await reviewModel
      .find({ docId })
      .select("userId rank comment createdAt helpfulVotes")
      .populate("userId", "name image");

    reviews = reviews.filter((review) => review.comment);
    res.json({ success: true, message: "all reviews", data: reviews });
  } catch (error) {
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
    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
        data: null,
      });
    }
    const isExists = review.helpfulVotes.includes(userId);
    if (!isExists) {
      review.helpfulVotes.push(userId);
      await review.save();
      res.json({
        success: true,
        message: "Review added successfully",
        data: review.helpfulVotes.length,
      });
    } else {
      review.helpfulVotes = review.helpfulVotes.filter(
        (review) => review !== userId,
      );
      await review.save();
      res.json({
        success: true,
        message: "Review removed successfully",
        data: review.helpfulVotes.length,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export default {
  addReview,
  getReviews,
  helpfulReview,
};
