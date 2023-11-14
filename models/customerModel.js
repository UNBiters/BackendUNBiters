const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./userModel');

const customerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'No tienes una cuenta UNBiters asociada'],
        unique: true
    },
    customerId: {
        type: String,
        required: [true, 'Todo cliente debe tener un identificador'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Por favor dinos tu nombre!']
    },
    email: {
        type: String,
        required: [true, 'Por favor dinos tu correo'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Por favor dinos tu correo valido']
    },
    city: {
        type: String,
        trim: true
    },
    adress: {
        type: String
    },
    phone: {
        type: String,
        required: [true, 'Por favor, ingrese un número de teléfono.'],
        trim: true,
        match: [/^\d{7,10}$/, 'Por favor, ingrese un número de teléfono válido.']
    },
    cell_phone: {
        type: String,
        required: [true, 'Por favor, ingrese un número de celular.'],
        trim: true,
        match: [/^\d{10}$/, 'Por favor, ingrese un número de celular válido.']
    }
}, {timestamps: true});

customerSchema.post('save', async function(doc) {
    await User.findByIdAndUpdate(doc.user, {
        cliente: true
    });
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;