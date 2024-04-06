const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: { type: Number },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    // trim removes white space at the beginning and end of the string
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(), // If user does not send this, the default value will be inserted.
      select: false, // Do not include this field in the api response.
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// You cannot use virtual properties in a query since it is not stores in db.
// Thet are only added during get calls.
toursSchema.virtual('durationWeeks').get(function () {
  // this is poiting to the current document object.
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
