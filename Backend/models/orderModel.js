const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: null },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['processing', 'delivered'],
    default: 'processing',
  },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
  shippingAddress: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['processing', 'delivered'],
    default: 'processing',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
