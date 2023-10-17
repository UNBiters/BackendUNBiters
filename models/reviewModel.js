// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Chaza = require('./chazaModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    chaza: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chaza',
      required: [true, 'La review debe estar asociada a una chaza']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'La review debe pertencer a un usuario']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ chaza: 1, user: 1 });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'nombre foto'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(chazaId) {
  console.log("hola desde review")
  const stats = await this.aggregate([
    {
      $match: { chaza: chazaId }
    },
    {
      $group: {
        _id: '$chaza',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Chaza.findByIdAndUpdate(chazaId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Chaza.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.chaza);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.chaza);
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
