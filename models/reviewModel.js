const mongoose = require('mongoose');
const Chaza = require('./chazaModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Por favor escribe un comentario antes de publicarlo']
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
    publication: {
      type: mongoose.Schema.ObjectId,
      ref: 'Publication',
      required: [true, 'El comentario debe estar asociado a una publicación']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'El comentario debe estar asociado a un usuario']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'nombre foto'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(chazaId) {
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
