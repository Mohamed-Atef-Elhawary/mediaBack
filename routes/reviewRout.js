import reviewController from "../controllers/reviewController.js";
import authUser from "../middleWares/authUser.js";
import express from "express";
const reviewRouter = express.Router();

reviewRouter.post("/add-review", authUser, reviewController.addReview);
reviewRouter.post("/all-reviews", authUser, reviewController.getReviews);
reviewRouter.post("/helpful-review", authUser, reviewController.helpfulReview);
export default reviewRouter;
