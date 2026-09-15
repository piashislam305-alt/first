const categoryService = require('../services/adminCategoryService');

const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories(req.query);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

module.exports = { getCategories };
