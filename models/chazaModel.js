const mongoose = require('mongoose');
const validator = require('validator');

const chazaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "Por favor dinos el nombre de tu chaza."],
        unique: true,
        trim: true
    },
    slug: String,
    propietarios: {
        type: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
        }],
        required: [true, "Toda chaza debe tener asociado un propietario."]
    },
    fechaFundacion: {
        type: Date
    },
    categorias: {
        type: [String],
        required: [true, "Toda chaza debe pertenecer a alguna categoria."]
    },
    descripcion: {    
        type: String,
        maxlength: [200, "Por favor danos una descripción con máximo 200 caracteres."]
    },
    ubicacion: {
        type: String,
        required: [true, "Por favor dinos la localización de tu chaza."],
        trim: true,
        maxlength: [50, "Dinos tu localización en menos de 30 caracteres."]
    },
    logo: {
        type: String
    },
    slogan: {
        type: String
    },
    nequi: {
        type: Boolean,
        required: [true, "Dinos si nequi es uno de tus métodos de pago."]
    },
    daviplata: {
        type: Boolean,
        required: [true, "Dinos si daviplata es uno de tus métodos de pago."]
    },
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
            maxlength: [180, "Describe tu producto en menos de 180 caracteres."]
        },
        fotos: [String] 
    }],
    horarioAtencion: {
        type: [String],
        required: [true, "Por favor dinos tu horario de atención."]
    },
    universidad: {
        type: String,
        default: "Universidad Nacional"
    },
    sede: {
        type: String,
        default: "Bogotá"
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
    etiquetas: [String],
    redesSociales: [String],
    paginaWeb: String
}, {timestamps: true});

// Rating propiedad virtual
// Reseñas virtual

const Chaza = mongoose.model('Chaza', chazaSchema);
module.exports = Chaza;