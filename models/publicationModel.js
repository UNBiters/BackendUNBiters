const mongoose = require('mongoose');
const Chaza = require('./chazaModel');
const slugify = require('slugify');

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
    }],
    slug: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

publicationSchema.index({'$**': 'text'});

// Tiene que estar incluido fechaNacimiento para que haga el calculo de edad en el populate
publicationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'nombre foto sexo correo edad fechaNacimiento'
  });
  next();
});


publicationSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'publication',
    localField: '_id'
});

publicationSchema.statics.numPublicationsChaza = async function(nombreChaza) {
    const numPublications = await mongoose.model('Publication').countDocuments({ slug: nombreChaza });
    return await Chaza.findOneAndUpdate({ slug: nombreChaza }, { numPublications });  
};

publicationSchema.pre('save', async function(next) {
    if (!this.nombreChaza) return next();
    this.slug = slugify(this.nombreChaza, { lower: true });
    const chazaId = await Chaza.findOne({ slug: this.slug }, '_id');
    if (chazaId) {
        this.chaza = chazaId.id
    } 
    next();
});

publicationSchema.pre(/^findOneAnd/, async function(next) {
    const update = this.getUpdate();

    // Solo aplica si 'nombreChaza' está en la actualización
    if (!update || !update.nombreChaza) return next();
    const slug = slugify(update.nombreChaza, { lower: true });
    this.set({ slug: slug }); 

    if (!update.$set) return next();
    const chazaId = await Chaza.findOne({ slug: update.$set.slug }, '_id');
    this.set({ chaza: chazaId });

    // updateOne
    
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


publicationSchema.post('save', async function(doc, next) {
    // this points to current review
    if (!doc) return next()
    await doc.constructor.numPublicationsChaza(doc.slug);
    await doc.constructor.calcAverageRatings(doc.chaza);

    // Si no es nuevo significa que es una actualización.
    // if (!doc.isNew) {
    //     await doc.numPublicationsPerSex(doc.user);
    // }
});

// publicationSchema.pre(/^findOneAnd/, async function(next) {
//     this.r = await this.findOne();
//     next();
// });

publicationSchema.post(/^findOneAnd/, async function(doc, next) {
    // await this.findOne(); does NOT work here, query has already executed
    if (!doc) return next()
    await doc.constructor.numPublicationsChaza(doc.slug);
    await doc.constructor.calcAverageRatings(doc.chaza);
});


const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
