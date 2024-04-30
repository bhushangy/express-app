/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator'); // External library to validate strings

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less than 40 characters'],
      minlength: [10, 'A tour must have more than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Possibile difficulty valuea are  - easy, medium, difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // val is the user input
          // this points to the current document and only works for new document and not update.
          // Note: This validator does not work for update.
          return val < this.price;
        },
        message: 'Discount price must be less than regular price',
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // An array of location objects that are of type GeoJSON
    locations: [
      {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        // This tells us that the type of each object in the guides array is an mongoDB ObjectId.
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Refer to the User model for the ObjectId.
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // This will include virtual properties in the api response.
    toObject: { virtuals: true },
  },
);

// You cannot use virtual properties in a query since it is not stored in db.
// They are only added during get calls.
toursSchema.virtual('durationWeeks').get(function () {
  // this is poiting to the current document object.
  return this.duration / 7;
});

// Dcoument middleware to run before save event i.e before document is saved in db. i.e on Tour.create and Tour.save
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Dcoument middleware run after document is saved into db.
toursSchema.post('save', function (doc, next) {
  // this points to the document that was saved into the db.
  next();
});

// When you embed the user documents in the tour document, it may cause problems during update.
// Because if the user document is updated, all the tours that have that user will also have to be updated.
// So, it is better to use reference to the user document.

// toursSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// Query middleware to run before running the Tour.find or Tour.findOne method.
// /ˆfind/ is regexp for strings that start with find.
toursSchema.pre(/^find/, function (next) {
  // this points to the query object and not the document.
  // This query is executed just before await query.execute in the controller.
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

toursSchema.pre(/^find/, function (next) {
  // Populate the guides field with the actual user data by using the reference. Remove __v and passwordChangedAt fields from the output.
  // Behind the scenes, populate creates a new query to get the data from the referenced document. So, it is better to use it only when needed.
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// Query middleware to run after running the Tour.find or Tour.findOne method.
toursSchema.post(/^find/, function (docs, next) {
  // docs is the result of the query.
  // this is still pointing to the query.
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

// Aggregation middleware to run before running the Tour.aggregate method.
toursSchema.pre('aggregate', function (next) {
  // this is pointing to the aggregation object which has the pipeline field
  // which is an array of all the pipeline stages in Tour.aggregate() method.
  // Add another match stage at the beginning of the pipeline to only match docs that are not true.
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
