import Review from "../models/Review.js";

// GET /api/admin/reviews (admin only)
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// GET /api/meals/:mealId/reviews (public - published only)
export const getReviewsForMeal = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      mealId: req.params.mealId,
      status: "Published",
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// POST /api/meals/:mealId/reviews (protected)
export const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment?.trim()) {
      res.status(400);
      throw new Error("Rating and comment are required");
    }

    const review = await Review.create({
      mealId: req.params.mealId,
      userId: req.user._id,
      author: req.user.name,
      rating,
      comment: comment.trim(),
      status: "Published",
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reviews/:id (protected - own review only)
export const updateOwnReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    if (String(review.userId) !== String(req.user._id)) {
      res.status(403);
      throw new Error("You can only edit your own review");
    }

    review.rating = rating ?? review.rating;
    review.comment = comment?.trim() ?? review.comment;

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id (protected - own review only)
export const deleteOwnReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    if (String(review.userId) !== String(req.user._id)) {
      res.status(403);
      throw new Error("You can only delete your own review");
    }

    await review.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/reviews/:id (admin only - moderate status)
export const setReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    review.status = status;
    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/reviews/:id (admin only)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    await review.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};