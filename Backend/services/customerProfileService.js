const User = require('../models/userModel');

const getProfile = async (customerId) => {
  const user = await User.findById(customerId).select('-password');
  if (!user) throw { status: 404, message: 'Customer not found.' };
  return user;
};

const updateProfile = async (customerId, updates) => {
  const allowed = ['name', 'phone', 'address', 'gender', 'DOB', 'image'];
  const data = {};
  for (const key of allowed) if (updates[key] !== undefined) data[key] = updates[key];

  if (data.name !== undefined && !String(data.name).trim()) {
    throw { status: 400, message: 'Name cannot be empty.' };
  }

  const user = await User.findByIdAndUpdate(customerId, data, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) throw { status: 404, message: 'Customer not found.' };
  return user;
};

module.exports = { getProfile, updateProfile };
