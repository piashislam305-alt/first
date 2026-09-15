const service = require('../services/customerProfileService');

const getCustomerProfile = async (req, res) => {
  try { res.json({ success: true, data: await service.getProfile(req.customer._id) }); }
  catch (error) { res.status(error.status || 500).json({ success: false, message: error.message || 'Server error.' }); }
};

const updateCustomerProfile = async (req, res) => {
  try { res.json({ success: true, message: 'Profile updated successfully.', data: await service.updateProfile(req.customer._id, req.body) }); }
  catch (error) { res.status(error.status || 500).json({ success: false, message: error.message || 'Server error.' }); }
};

module.exports = { getCustomerProfile, updateCustomerProfile };
