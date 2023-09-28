// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review no puede estar vacia!']
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
      required: [true, 'La review debe pertenecer a una chaza']
    },
    usuario: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'La review debe pertenercer a un usuario']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
