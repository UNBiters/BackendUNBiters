const mongoose = require('mongoose');
const Chaza = require('./chazaModel');

const publicationSchema = new mongoose.Schema(
  {
    // title: {
    //     type: String,
    //     maxlength: [40, 'El título debe tener máximo 40 caracteres'],
    //     trim: true,
    //     required: [true, 'Una publicación debe tener un título']
    // },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'La publicación debe estar asociado a un usuario']
    },
    texto: {
        type: String,
        required: [true, 'La publicación debe tener un texto']
    },
    imagenUrl: {
        type: String,
    },
    imagenId: {
        type: String,
    },
    likes: {
        type: Number,
        default: 0
    },
    numComentarios: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    chaza: {
        type: mongoose.Schema.ObjectId,
        ref: 'Chaza',
        // required: [true, 'La review debe estar asociada a una chaza']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    nombreChaza: {
        type: String,
        trim: true
    },
    tags: [{
        type: String
    }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

publicationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'nombre foto'
  });
  next();
});


publicationSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'publication',
    localField: '_id'
});

publicationSchema.pre('save', async function(next) {
    if (!this.nombreChaza) return next();
    const chazaId = await Chaza.findOne({nombre: this.nombreChaza}, '_id');
    if (chazaId) {
        this.chaza = chazaId.id
    } 
    next();
});

publicationSchema.statics.calcAverageRatings = async function(chazaId) {
    if (!chazaId) return
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
        await Chaza.findByIdAndUpdate(chazaId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
        });
    }
};

publicationSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.chaza);
});

// publicationSchema.pre(/^findOneAnd/, async function(next) {
//     this.r = await this.findOne();
//     next();
// });

publicationSchema.post(/^findOneAnd/, async function(doc, next) {
    // await this.findOne(); does NOT work here, query has already executed
    if (!doc) return next()
    await doc.constructor.calcAverageRatings(doc.chaza);
});


const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
