const mongoose = require('mongoose');
const slugify = require('slugify');

const planSchema = new mongoose.Schema({
    id_plan: {
        type: String,
    },
    name: {
        type: String,
        required: [true, "Todo plan debe tener un nombre"],
        trim: true,
        unique: true
    },
    description: {
        type: String
    },
    amount: {
        type: Number,
        required: [true, "Toda suscripción debe tener un precio"]
    },
    currency: {
        type: String,
        enum: ['usd', 'cop'],
        required: [true, "Todo plan debe espeificar su divisa de pago"]
    },
    interval: {
        type:String,
        enum: ['month', 'year'],
        required: [true, "Toda suscripción debe tener un intervalo de tiempo"]
    },
    interval_count: {
        type: Number
    },
    trial_days: {
        type: Number
    },
    status: {
        type: String,
        default: 'activo'
    }
}, {timestamps: true});

planSchema.pre('save', function(next) {
    this.id_plan = slugify(this.name, {lower: true})
    next()
})

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;