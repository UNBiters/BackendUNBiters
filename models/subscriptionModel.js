const mongoose = require('mongoose');

const subscriptionModel = new mongoose.Schema({
    id_plan: {
        type: String,
        required: [true, 'La suscripción debe estar asociada a un plan']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'La suscripción debe estar asociada a tu cuenta UNBiters']
    },
    customer: {
        type: String,
        required: [true, 'La suscripción debe estar asociada a un cliente'],
        unique: [true, 'Ya tienes una suscripción activa']
    },
    token_card: {
        type: String,
        required: [true, 'La suscripción debe estar asociada a un token_card']
    },
    doc_type: {
        type: String,
        enum: ["CC", "NIT", "CE", "PPN", "SSN", "LIC", "DNI", "PEP"],
        required: [true, 'Por favor especifice el tipo de documento']
    },
    doc_number: {
        type: String,
        required: [true, 'Por favor digite su número de documento']
    },
    url_confirmation: {
        type: String,
        default: "https://ejemplo.com/confirmacion"
    },
    method_confirmation: {
        type: String,
        default: "POST"
    },
    status: {
        type: String,
        default: "inactiva",
        enum: ['inactiva', 'cancelada', 'activa']
    },
    subscriptionId: {
        type: String,
        required: [true, 'Toda suscripción debe tener un id'],
        unique: true
    }
}, {timestamps: true});



const Subscription = mongoose.model('Subscription', subscriptionModel);

module.exports = Subscription;