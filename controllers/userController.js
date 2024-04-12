const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const filterFields = (obj, ...allowedFields) => {
  const objectWithRequiredFields = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      objectWithRequiredFields[key] = obj[key];
    }
  });

  return objectWithRequiredFields;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('Update only possible for name or email fields!!', 400),
    );
  }

  const { user } = req;

  // If we use save, validators will run and throw error since
  // there is no password in request body.
  const allowedFieldsForUpdate = ['name', 'email'];
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    filterFields(req.body, ...allowedFieldsForUpdate),
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: '',
    data: {},
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: '',
    data: {},
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: '',
    data: {},
  });
};
