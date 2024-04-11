const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    });

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: {
                name: newUser.name,
                email: newUser.email,
            },
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password is sent by user ?
    if (!email || !password) {
        return next(new AppError('Please provide email and passowrd', 400));
    }

    // Check is email exists in db and passowrd is correct

    // Since password is excluded from all find/findOne queries, we need to explicity
    // ask for it be included with select function.
    const user = await User.findOne({ email }).select('+password');
    // Since user is a document, it can access all instance methods defined on user schema.

    if (!user || !(await user.validatePassword(password, user.password))) {
        return next(new AppError('Incorrect email or password!!', 401));
    }

    // Send back token
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // Extract token from header
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Please login to get access!!', 401));
    }

    // Validate token

    // Check if user still exists

    // Check if user has changed password after token was issued
    next();
});
