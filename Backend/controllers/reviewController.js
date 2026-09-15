const service = require('../services/reviewService');
const error = (res, e) => res.status(e.status || 500).json({ success: false, message: e.message || 'Server error.' });

const listReviews = async (req, res) => {
  try { res.json({ success: true, data: await service.getProductReviews(req.params.productId) }); }
  catch (e) { error(res, e); }
};

const createReview = async (req, res) => {
  try {
    const { rating, description } = req.body;
    const value = Number(rating);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'rating must be an integer from 1 to 5.' });
    }
    const data = await service.createReview(req.customer._id, req.params.productId, value, description);
    res.status(201).json({ success: true, message: 'Review submitted successfully.', data });
  } catch (e) { error(res, e); }
};

module.exports = { listReviews, createReview };
