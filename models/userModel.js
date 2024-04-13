const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true, // Transforms user input email to lowercase
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false, // Exclude this field from all selct/find/findOne queries.
        // Note that you will still get these fields on save. i.e after creating a new user.
        // Then you have to manually set these fields to undefined in the document in the controller.
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (userInput) {
                // this points to the current document before it gets saved in db.
                // It only works on save and not update. i.e this validator does not run on update.
                return userInput === this.password;
            },
            message: 'Passwords should be the same!!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.pre('save', async function (next) {
    // Encrypt password only if we are saving it for first time or if password was modififed.
    if (!this.isModified('password')) next();

    this.password = await bcrypt.hash(this.password, 12);
    // password confirm is only for validation. It should not be stored in db.
    // To not store a field in db, just set it to undefined.
    // Note that passwordConfirm is a required field. But it only means that it is compulsory user
    // input and not compulsory to be stored in db.
    this.passwordConfirm = undefined;
    next();
});

// Update passwordChangedAt field when user updates password.
// But do not set it for a new document.
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// Instance methods - methods that are available on all the documents of a schema
userSchema.methods.validatePassword = async function (
    candidatePassword,
    userPassword,
) {
    // candidate password - password entered by user during login.
    // user password - passwor entered by user during signup.
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfterJwtWasIssued = function (JWTTimestamp) {
    // this is pointing to the document that calls this method.
    // document is the object on which this method is invoked.
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10,
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
