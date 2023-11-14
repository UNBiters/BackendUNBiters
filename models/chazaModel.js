const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require("./userModel");
const AppError = require('../utils/appError');

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
    horarioAtencion:  [{
        type: String
        
    }],
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
    mediosPagos:  [{
        type: String
    }],
    etiquetas: [String],
    redesSociales: [String],
    imagenUrl: {
        type: String,
    },
    imagenId: {
        type: String,
    },
    tags: [{
        type: String
    }],
    paginaWeb: String,
    facebook: String,
    instagram: String,
    numPublications: {
        type: Number,
        default: 0
    }
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

chazaSchema.statics.numChazasPropietario = async function(propietario) {
    const stats = await this.aggregate([
        {
            $match: { "propietarios": propietario} 
        },
        {
            $unwind: "$propietarios"
        },
        {
            $group: {
                _id: "$propietarios",
                count: { $sum: 1 }
            }
        }
    ]);
    if (stats.length > 0) {
        return stats[0].count;
    } else {
        return 0;
    }
}



chazaSchema.pre("save", async function(next) {
    const numChazas = await this.constructor.numChazasPropietario(this.propietarios);
    const propietario = await User.findById(this.propietarios);
    if (numChazas == 1 && propietario.nivelSuscripcion == 0) {
        return next(new AppError("Si deseas tener más de una chaza, por favor adquiere el plan especial", 403));
    } else  {
        next();
    }
});
  
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
chazaSchema.pre('save', function(next) {
    this.slug = slugify(this.nombre, { lower: true });
    next();
});

chazaSchema.pre("save", async function(next) {
    const Publication = mongoose.model("Publication");

    // Contar publicaciones existentes
    const numPublications = await Publication.countDocuments({ slug: this.slug });

    // Actualizar el campo 'chaza' en las publicaciones que coincidan
    if (numPublications) {
        await Publication.updateMany({ slug: this.slug }, { chaza: this._id });
        this.numPublications = numPublications;
    }
    
    next();
});

chazaSchema.post("save", async function(doc, next) {
    const Publication = mongoose.model("Publication");
    await Publication.calcAverageRatings(doc._id);
})


const Chaza = mongoose.model('Chaza', chazaSchema);
module.exports = Chaza;