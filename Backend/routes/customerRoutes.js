const express = require('express');
const router = express.Router();

const { registerCustomer, loginCustomer } = require('../controllers/customerAuthController');
const { getCustomerProfile, updateCustomerProfile } = require('../controllers/customerProfileController');
const { protectCustomer } = require('../middleware/authMiddleware');

// 4.1 Auth & Profile
router.post('/auth/register', registerCustomer);
router.post('/auth/login', loginCustomer);
router.get('/me', protectCustomer, getCustomerProfile);
router.patch('/me', protectCustomer, updateCustomerProfile);

module.exports = router;
