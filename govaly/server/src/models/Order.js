import mongoose from 'mongoose';

const ORDER_STATUSES = ['Placed', 'Processing', 'Delivered', 'Cancelled']; // SRS: simple flow (COD only)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    orderId: { type: String, required: true, unique: true },
    items: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        slug: String,
        name: String,
        image: String,
        seller: { type: String, default: '' },
        color: { type: String, default: '' },
        size: String,
        price: Number,
        mrp: Number,
        qty: Number,
        review: {
          type: { type: String, enum: ['Positive', 'Negative', 'Neutral', null], default: null },
          rating: { type: Number, default: 0 },
          comment: { type: String, default: '' },
        },
      },
    ],
    address: {
      fullName: String,
      phone: String,
      division: String,
      city: String,
      area: String,
      address: String,
    },
    payment: {
      method: { type: String, enum: ['cod'], default: 'cod' }, // SRS: Cash on Delivery only
      status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
      txnId: { type: String, default: '' },
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'Placed', index: true },
    shopRating: { type: Number, default: 0 },
    serviceRating: { type: Number, default: 0 },
    timeline: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
  },
  { timestamps: true }
);

export { ORDER_STATUSES };
export default mongoose.model('Order', orderSchema);
