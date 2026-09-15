const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
} = require("../controllers/productController");
const { protectSeller } = require("../middleware/authMiddleware");
const { listReviews } = require("../controllers/reviewController");

// Existing seller product creation endpoint (kept for compatibility)
router.post("/products", protectSeller, createProduct);

// Public product APIs
router.get("/products", getProducts);
router.get("/products/:productId", getProductById);

module.exports = router;

// Public product reviews
router.get("/products/:productId/reviews", listReviews);
