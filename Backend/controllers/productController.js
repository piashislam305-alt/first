const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Create a new product
// @route   POST /seller/products
// @access  Private (Seller only)
const createProduct = async (req, res) => {
    try {
        const { name, category, sale_price, description, image, stock, status } = req.body;

        if (!name || !category || !sale_price || !description || !image || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: name, category, sale_price, description, image, stock",
            });
        }

        const product = await Product.create({
            name,
            category,
            sale_price,
            description,
            image,
            stock,
            status: status || "in_stock",
            seller: req.seller._id, // logged-in seller theke ashbe (auth middleware)
        });

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// @desc    Browse/search public products
// @route   GET /api/v1/products
const getProducts = async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };
        const sortMap = {
            newest: { createdAt: -1 },
            price_asc: { sale_price: 1 },
            price_desc: { sale_price: -1 },
        };
        const products = await Product.find(filter)
            .populate('category', 'name subcategory')
            .populate('seller', 'shopName')
            .sort(sortMap[sort] || { createdAt: -1 });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Public product detail
// @route   GET /api/v1/products/:productId
const getProductById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID.' });
        }
        const product = await Product.findById(req.params.productId)
            .populate('category', 'name subcategory')
            .populate('seller', 'shopName');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
};