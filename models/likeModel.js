const mongoose = require('mongoose');
// const Chaza = require('./chazaModel');
const Publication = require('./publicationModel');
const searchController = require('../controllers/searchController');

const likeSchema = new mongoose.Schema({
    // chaza: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Chaza',
    //     required: [true, 'El like debe estar asociado a una chaza']
    //   },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'El like debe estar asociado a un usuario']
      },
    publication: {
        type: mongoose.Schema.ObjectId,
        ref: 'Publication',
        required: [true, 'El like debe estar asociado a una publicación']
      },
    active: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});


// likeSchema.index({ user: 1, publication: 1 }, { unique: true });

likeSchema.statics.calcLikes = async function(publicationId) {
  
  const stats = await this.aggregate([
    {
      $match: { publication: publicationId, active: true}
    },
    {
      $group: {
        _id: '$publication',
        numLikes: { $sum: 1 },
      }
    }
  ]);
  if (stats.length > 0) {
    await Publication.findByIdAndUpdate(publicationId, {
      likes: stats[0].numLikes
    });
    searchController.updateDocuments("Publication", publicationId, { likes: stats[0].numLikes })
  } else {
    await Publication.findByIdAndUpdate(publicationId, {
      likes: 0
    });
    searchController.updateDocuments("Publication", publicationId, { likes: 0 })
  }
};

likeSchema.post('save', function() {
  // this points to current review
  this.constructor.calcLikes(this.publication);
});

// likeSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

likeSchema.post(/^findOneAnd/, async function(doc) {
  // await this.findOne(); does NOT work here, query has already executed
  await doc.constructor.calcLikes(doc.publication);
});


const Like = mongoose.model('Like', likeSchema);

module.exports = Like;