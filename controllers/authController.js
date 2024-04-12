const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
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
    // verify is an async operation that takes a 3rd argument which is a callback.
    // Instead we can promisify this function.
    const decodedToken = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
    );

    // Check if user still exists in db
    const currentUser = await User.findById(decodedToken.id).select('+password');
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401,
            ),
        );
    }

    // Check if user has changed password after token was issued
    if (currentUser.changedPasswordAfterJwtWasIssued(decodedToken.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again.', 401),
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

exports.restrict =
    (...roles) =>
        (req, res, next) => {
            // roles obtained from token should be one of the admin roles i.e admin, super-user.
            // Inner function has access to outer function roles due to closure.
            if (!roles.includes(req.user.role)) {
                return next(
                    new AppError('You do not have permission to perform this action', 403),
                );
            }

            next();
        };

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    // validateBeforeSave set to false does not run the vaildator in schema before saving.
    // because here we are not entering email and password.
    // But why use save when we can do update ?
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host',
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500,
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // But why use save when we can do update ?
    // Because, we want to run the validators and save middlewares. If we do findOne and update,
    // then validators will not run and save middleware will not fire.
    // Even though the request is a patch, we still do save instead of update.
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { currentPassword, newPassword, passwordConfirm } = req.body;

    if (
        !currentPassword ||
        !(await user.validatePassword(currentPassword, user.password))
    ) {
        return next(new AppError('Incorrect password!!', 401));
    }

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
});
