const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Product = require('../models/Product');

const populateCart = (query) => query.populate({
  path: 'items.product',
  populate: [
    { path: 'seller', select: 'shopName shopSlug ratings' },
    { path: 'category', select: 'name' },
  ],
});

const getCart = async (customerId) => {
  const cart = await populateCart(Cart.findOne({ customer: customerId }));
  return cart || { customer: customerId, items: [] };
};

const validateQuantity = (quantity) => {
  const value = Number(quantity);
  if (!Number.isInteger(value) || value < 1) {
    throw { status: 400, message: 'Quantity must be a positive integer.' };
  }
  return value;
};

const addItem = async (customerId, productId, quantity = 1) => {
  if (!mongoose.isValidObjectId(productId)) throw { status: 400, message: 'Invalid product ID.' };
  quantity = validateQuantity(quantity);

  const product = await Product.findById(productId);
  if (!product) throw { status: 404, message: 'Product not found.' };
  if (product.stock < quantity) throw { status: 400, message: `Only ${product.stock} item(s) available.` };

  const cart = await Cart.findOneAndUpdate(
    { customer: customerId },
    { $setOnInsert: { customer: customerId } },
    { new: true, upsert: true }
  );

  const item = cart.items.find((entry) => entry.product.toString() === productId.toString());
  const newQuantity = item ? item.quantity + quantity : quantity;
  if (newQuantity > product.stock) throw { status: 400, message: `Only ${product.stock} item(s) available.` };

  if (item) item.quantity = newQuantity;
  else cart.items.push({ product: productId, quantity });

  await cart.save();
  return getCart(customerId);
};

const updateItem = async (customerId, itemId, quantity) => {
  if (!mongoose.isValidObjectId(itemId)) throw { status: 400, message: 'Invalid cart item ID.' };
  quantity = validateQuantity(quantity);

  const cart = await Cart.findOne({ customer: customerId });
  if (!cart) throw { status: 404, message: 'Cart not found.' };

  const item = cart.items.id(itemId);
  if (!item) throw { status: 404, message: 'Cart item not found.' };

  const product = await Product.findById(item.product);
  if (!product) throw { status: 404, message: 'Product not found.' };
  if (product.stock < quantity) throw { status: 400, message: `Only ${product.stock} item(s) available.` };

  item.quantity = quantity;
  await cart.save();
  return getCart(customerId);
};

const removeItem = async (customerId, itemId) => {
  if (!mongoose.isValidObjectId(itemId)) throw { status: 400, message: 'Invalid cart item ID.' };
  const cart = await Cart.findOne({ customer: customerId });
  if (!cart) throw { status: 404, message: 'Cart not found.' };

  const item = cart.items.id(itemId);
  if (!item) throw { status: 404, message: 'Cart item not found.' };
  item.deleteOne();
  await cart.save();
  return getCart(customerId);
};

module.exports = { getCart, addItem, updateItem, removeItem };
