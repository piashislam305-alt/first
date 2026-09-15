const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const Product = require('../models/Product');
const Order = require('../models/orderModel');

const getProductReviews = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) throw { status: 400, message: 'Invalid product ID.' };
  return Review.find({ product: productId })
    .populate('customer', 'name image')
    .sort({ createdAt: -1 });
};

const createReview = async (customerId, productId, rating, description = '') => {
  if (!mongoose.isValidObjectId(productId)) throw { status: 400, message: 'Invalid product ID.' };
  if (!await Product.exists({ _id: productId })) throw { status: 404, message: 'Product not found.' };

  const purchasedAndDelivered = await Order.exists({
    customer: customerId,
    items: { $elemMatch: { product: productId, status: 'delivered' } },
  });

  if (!purchasedAndDelivered) {
    throw { status: 403, message: 'You can review a product only after it has been delivered to you.' };
  }

  try {
    return await Review.create({ customer: customerId, product: productId, rating, description });
  } catch (error) {
    if (error.code === 11000) throw { status: 409, message: 'You have already reviewed this product.' };
    throw error;
  }
};

module.exports = { getProductReviews, createReview };
