const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Por favor escribe un comentario antes de publicarlo']
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



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
