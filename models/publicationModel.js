const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'El comentario debe estar asociado a un usuario']
    },
    text: {
        type: String,
        required: [true, 'La publicación debe tener un texto']
    },
    imagen: {
        type: String,
    },
    likes: {
        type: Number,
        default: 0
    },
    chaza: {
        type: mongoose.Schema.ObjectId,
        ref: 'Chaza',
        // required: [true, 'La review debe estar asociada a una chaza']
      },
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

chazaSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'chaza',
    localField: '_id'
  });



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
