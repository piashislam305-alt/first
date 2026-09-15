import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    group: { type: String, required: true, index: true },
    parent: { type: String, default: '', index: true }, // slug of parent category ('' for top-level)
    isParent: { type: Boolean, default: false },         // true = Men / Women / Kids / Baby / Health & Beauty
    image: { type: String, default: '' },
    banner: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
