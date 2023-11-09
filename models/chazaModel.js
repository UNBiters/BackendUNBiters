const mongoose = require('mongoose');
const slugify = require('slugify');

const chazaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "Por favor dinos el nombre de tu chaza"],
        unique: true,
        trim: true,
    },
    slug: String,
    propietarios: {
        type: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
        }],
        required: [true, "Toda chaza debe tener asociado un propietario"]
    },
    seguidores: {
        type: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
        }],
    },
    numSeguidores: {
        type: Number,
        default: 0
    },
    fechaFundacion: {
        type: Date
    },
    categorias: {
        type: [String],
        required: [true, "Toda chaza debe pertenecer a alguna categoria"]
    },
    descripcion: {    
        type: String,
        maxlength: [200, "Por favor danos una descripción de máximo 200 caracteres"]
    },
    ubicacion: {
        type: String,
        required: [true, "Por favor dinos la localización de tu chaza"],
        trim: true,
        maxlength: [50, "Dinos tu localización en menos de 30 caracteres"]
    },
    logo: {
        type: String
    },
    slogan: {
        type: String
    },
    /*nequi: {
        type: Boolean,
        required: [true, "Dinos si nequi es uno de tus métodos de pago"]
    },
    daviplata: {
        type: Boolean,
        required: [true, "Dinos si daviplata es uno de tus métodos de pago"]
    },¨*/
    productos: [{
        nombre: {
            type: String,
            required: [true, "Todo producto debe tener un nombre"]
        },
        precio: {
            type: Number,
            required: [true, "Todo producto debe tener asociado un precio"]
        },
        descripcion: {
            type: String,
            maxlength: [180, "Describe tu producto en menos de 180 caracteres"]
        },
        imagenes: [String] 
    }],
    horarioAtencion: {
        type: [String],
        required: [true, "Por favor dinos tu horario de atención"]
    },
    universidad: {
        type: String,
        default: "Universidad Nacional"
    },
    sede: {
        type: String,
        default: "Bogotá"
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'La valoración debe estár por encima de 1.0'],
        max: [5, 'La valoración debe estár por debajo de 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    ciudad: {
        type: String,
        default: "Bogotá"
    },
    fotos: [String],
    banner: String,
    domicilios: {
        type: Boolean,
        default: false
    },
    mediosPagos: [String],
    etiquetas: [String],
    redesSociales: [String],
    imagenUrl: {
        type: String,
    },
    imagenId: {
        type: String,
    },
    paginaWeb: String,
    facebook: String,
    instagram: String
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});


// Virtual populate
chazaSchema.virtual('publications', {
    ref: 'Publication',
    foreignField: 'chaza',
    localField: '_id'
});
  
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
chazaSchema.pre('save', function(next) {
    this.slug = slugify(this.nombre, { lower: true });
    next();
});


const Chaza = mongoose.model('Chaza', chazaSchema);
module.exports = Chaza;