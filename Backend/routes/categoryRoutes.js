const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');

// 4.2 Home, Categories, Search
router.get('/', getCategories);

module.exports = router;
