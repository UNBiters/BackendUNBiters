const mongoose = require('mongoose');
const Chaza = require('./chazaModel');

const likeSchema = new mongoose.Schema({
    chaza: {
        type: mongoose.Schema.ObjectId,
        ref: 'Chaza',
        required: [true, 'El like debe estar asociado a una chaza']
      },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'El like debe estar asociado a un usuario']
      },
    active: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});


likeSchema.index({ user: 1, chaza: 1 }, { unique: true });

likeSchema.statics.calcLikes = async function(chazaId) {
  
  const stats = await this.aggregate([
    {
      $match: { chaza: chazaId, active: true}
    },
    {
      $group: {
        _id: '$chaza',
        numLikes: { $sum: 1 },
      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0) {
    console.log("Entro a la funcion !!!!!!")
    await Chaza.findByIdAndUpdate(chazaId, {
      likes: stats[0].numLikes
    });
  } else {
    await Chaza.findByIdAndUpdate(chazaId, {
      likes: 0
    });
  }
};

likeSchema.post('save', function() {
  // this points to current review
  this.constructor.calcLikes(this.chaza);
});

// likeSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

likeSchema.post(/^findOneAnd/, async function(doc) {
  // await this.findOne(); does NOT work here, query has already executed
  await doc.constructor.calcLikes(doc.chaza);
});


const Like = mongoose.model('Like', likeSchema);

module.exports = Like;