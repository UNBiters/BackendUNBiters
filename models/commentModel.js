const mongoose = require('mongoose');
const validator = require('validator');

const commentSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: [true, 'Por favor dinos tu nombre de usuario']
    },
    contenido: {
        type: String,
        required: [true, 'Por favor escribe un comentario']
    },
    fechaPublicacion: {
        type: Date,
        default: Date.now()
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review', // Referencia al modelo de revisión
        required: [true, 'El comentario debe pertenecer a una review']
    }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;