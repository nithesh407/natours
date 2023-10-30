const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation nt in existing document
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      // default: false,
    },
    // secreteTour: {
    //   type: Boolean,
    // },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // eslint-disable-next-line prettier/prettier
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  if (this.duration > 7) {
    return this.duration / 7; //this keyword will only be used in normal function syntax not in arrow functions
  }
  return 1;
});

//DOCUMENT MIDDLEWARE : runs before .save() and .create()
tourSchema.pre("save", function (next) {
  //this references the currently processed document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", (next) => {
//   //pre hook or pre middleware which executes before .save() or .create()
//   //this references the currently processed document
//   console.log("document will save");
//   next();
// });

// tourSchema.post("save", (doc, next) => {
//   //post hook or post middleware which executes after.save() or.create()
//   //this references the currently processed document
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  //here this refers to the currently proces sed query
  this.find({ secreteTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// tourSchema.pre("findOne", function (next) {
//   //here this refers to the currently processed query
//   this.find({ secreteTour: { $ne: true } });
//   next();
// });

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    // eslint-disable-next-line prettier/prettier
    `Query took ${Date.now() - this.start} milliseconds!`
  );
  // console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  //this refers to the current aggregation object
  //unshift adds the query at the beggining
  //shift adds the query at the end
  this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

//TO SAVE THE DOCUMENT MANUALLY
// const testTour = new Tour({
//   name: 'nithesh',
//   rating: 7.0,
//   price: 397,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = Tour;
