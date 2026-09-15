const express = require("express");
const router = express.Router();

const { createReview } = require("../controllers/reviewController");
const { protectCustomer } = require("../middleware/authMiddleware");

// Customer review submission
router.post("/products/:id/review", protectCustomer, (req, res, next) => {
  req.params.productId = req.params.id;
  return createReview(req, res, next);
});

module.exports = router;
