const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Product = require('../models/Product');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

const refreshProductStatus = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return;
  product.status = product.stock > 0 ? 'in_stock' : 'out_of_stock';
  await product.save();
};

const checkout = async (customerId, { shippingAddress, phone, paymentMethod = 'COD' }) => {
  const customer = await User.findById(customerId);
  if (!customer) throw { status: 404, message: 'Customer not found.' };
  if (paymentMethod !== 'COD') throw { status: 400, message: 'Only Cash on Delivery (COD) is supported.' };

  shippingAddress = String(shippingAddress || customer.address || '').trim();
  phone = String(phone || customer.phone || '').trim();
  if (!shippingAddress || !phone) throw { status: 400, message: 'Shipping address and phone are required.' };

  const cart = await Cart.findOne({ customer: customerId });
  if (!cart || cart.items.length === 0) throw { status: 400, message: 'Cart is empty.' };

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);
    if (!product) throw { status: 400, message: 'A product in your cart no longer exists.' };
    if (product.stock < cartItem.quantity) {
      throw { status: 409, message: `${product.name} has only ${product.stock} item(s) left.` };
    }

    const subtotal = Number(product.sale_price) * cartItem.quantity;
    orderItems.push({
      product: product._id,
      seller: product.seller,
      productName: product.name,
      productImage: product.image,
      unitPrice: product.sale_price,
      quantity: cartItem.quantity,
      subtotal,
      status: 'processing',
    });
    totalAmount += subtotal;
  }

  const decremented = [];
  try {
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, sold_items: item.quantity } },
        { new: true }
      );
      if (!updated) throw { status: 409, message: 'Stock changed while placing the order. Please try again.' };
      decremented.push(item);
      await refreshProductStatus(item.product);
    }

    const order = await Order.create({
      customer: customerId,
      items: orderItems,
      shippingAddress,
      phone,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      totalAmount,
      status: 'processing',
    });

    cart.items = [];
    await cart.save();

    return Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.seller', 'shopName shopSlug')
      .populate('items.product', 'name image sale_price');
  } catch (error) {
    for (const item of decremented) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold_items: -item.quantity } });
      await refreshProductStatus(item.product);
    }
    throw error;
  }
};

const listCustomerOrders = async (customerId, query = {}) => {
  const filter = { customer: customerId };
  if (query.status) {
    if (!['processing', 'delivered'].includes(query.status)) throw { status: 400, message: 'Invalid order status.' };
    filter.status = query.status;
  }
  return Order.find(filter)
    .populate('items.seller', 'shopName shopSlug')
    .populate('items.product', 'name image sale_price')
    .sort({ createdAt: -1 });
};

const getCustomerOrder = async (customerId, orderId) => {
  if (!mongoose.isValidObjectId(orderId)) throw { status: 400, message: 'Invalid order ID.' };
  const order = await Order.findOne({ _id: orderId, customer: customerId })
    .populate('items.seller', 'shopName shopSlug')
    .populate('items.product', 'name image sale_price');
  if (!order) throw { status: 404, message: 'Order not found.' };
  return order;
};

const trackCustomerOrder = async (customerId, orderId) => {
  const order = await getCustomerOrder(customerId, orderId);
  return {
    orderId: order._id,
    status: order.status,
    items: order.items.map((item) => ({
      itemId: item._id,
      productId: item.product?._id || item.product,
      productName: item.productName,
      status: item.status,
    })),
    updatedAt: order.updatedAt,
  };
};

const listSellerOrders = async (sellerId, query = {}) => {
  const filter = { 'items.seller': sellerId };
  if (query.status) {
    if (!['processing', 'delivered'].includes(query.status)) throw { status: 400, message: 'Invalid order status.' };
    filter['items.status'] = query.status;
  }
  return Order.find(filter)
    .populate('customer', 'name email phone address')
    .populate('items.product', 'name image sale_price')
    .sort({ createdAt: -1 });
};

const getSellerOrder = async (sellerId, orderId) => {
  if (!mongoose.isValidObjectId(orderId)) throw { status: 400, message: 'Invalid order ID.' };
  const order = await Order.findOne({ _id: orderId, 'items.seller': sellerId })
    .populate('customer', 'name email phone address')
    .populate('items.product', 'name image sale_price');
  if (!order) throw { status: 404, message: 'Order not found.' };
  order.items = order.items.filter((item) => item.seller.toString() === sellerId.toString());
  return order;
};

const updateSellerOrderStatus = async (sellerId, orderId, status) => {
  if (!['processing', 'delivered'].includes(status)) throw { status: 400, message: 'Status must be Processing or Delivered.' };
  const order = await Order.findOne({ _id: orderId, 'items.seller': sellerId });
  if (!order) throw { status: 404, message: 'Order not found.' };

  const sellerItems = order.items.filter((item) => item.seller.toString() === sellerId.toString());
  for (const item of sellerItems) {
    if (item.status === 'delivered' && status === 'processing') {
      throw { status: 400, message: 'A delivered item cannot be moved back to processing.' };
    }
    item.status = status;
  }

  const allDelivered = order.items.every((item) => item.status === 'delivered');
  order.status = allDelivered ? 'delivered' : 'processing';
  await order.save();

  return getSellerOrder(sellerId, orderId);
};

module.exports = {
  checkout,
  listCustomerOrders,
  getCustomerOrder,
  trackCustomerOrder,
  listSellerOrders,
  getSellerOrder,
  updateSellerOrderStatus,
};
