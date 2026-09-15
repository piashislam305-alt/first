const mongoose = require('mongoose');
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/Product');

const getWishlist = async (customerId) => {
  const wishlist = await Wishlist.findOne({ customer: customerId }).populate({
    path: 'products',
    populate: [
      { path: 'seller', select: 'shopName shopSlug ratings' },
      { path: 'category', select: 'name' },
    ],
  });
  return wishlist || { customer: customerId, products: [] };
};

const addProduct = async (customerId, productId) => {
  if (!mongoose.isValidObjectId(productId)) throw { status: 400, message: 'Invalid product ID.' };
  if (!await Product.exists({ _id: productId })) throw { status: 404, message: 'Product not found.' };

  await Wishlist.findOneAndUpdate(
    { customer: customerId },
    { $addToSet: { products: productId }, $setOnInsert: { customer: customerId } },
    { new: true, upsert: true }
  );
  return getWishlist(customerId);
};

const removeProduct = async (customerId, productId) => {
  if (!mongoose.isValidObjectId(productId)) throw { status: 400, message: 'Invalid product ID.' };
  const wishlist = await Wishlist.findOne({ customer: customerId });
  if (!wishlist) throw { status: 404, message: 'Wishlist not found.' };

  const before = wishlist.products.length;
  wishlist.products = wishlist.products.filter((id) => id.toString() !== productId.toString());
  if (wishlist.products.length === before) throw { status: 404, message: 'Product is not in the wishlist.' };

  await wishlist.save();
  return getWishlist(customerId);
};

module.exports = { getWishlist, addProduct, removeProduct };
