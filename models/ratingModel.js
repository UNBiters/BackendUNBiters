const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  chaza: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chaza',
    required: [true, "El codigo de chaza no es correcto o no existe"],
  },
  usuario:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, "El codigo de usuario no es correcto o no existe"]
  },
  plato: {
    type: mongoose.Schema.ObjectId,
    required: [true, "El codigo del plato no es correcto o no existe"],
  },
  rating: {
    type: Number,
    required: [true, "Debes calificar al establecimiento"],
    min: 1,
    max: 5,
  },
  fechaRating: {
    type: Date,
    default: Date.now(),
  },
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;