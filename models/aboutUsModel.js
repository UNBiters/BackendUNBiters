const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema(
  {
    nombre: {
        type: String,
    },
    cargo: {
        type: String,
    },
    description: {
        type: String,
    },
    facebook: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    github: {
        type: String,
    },
    url: {
        type: String,
    }
  },
  {
    timestamps: true
  }
);


const AboutUs = mongoose.model('AboutUs', aboutUsSchema);

module.exports = AboutUs;
