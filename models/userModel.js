const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'Por favor dino tu nombre!']
    },
    correo: {
        type: String,
        required: [true, 'Por favor dinos tu correo'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Por favor dinos tu correo valido']
    },
    foto: {
        type: String,
        default: 'default.jpg'
    },
    rol: {
        type: String,
        enum: ['usuario', 'chazaUser', 'admin'],
        default: 'usuario'
    },
    contraseña: {
        type: String,
        required: [true, 'Por favor escribe una contraseña'],
        minlength: 8,
        select: false
    },
    confirmarContraseña: {
        type: String,
        required: [true, 'Por favor confirma tu contraseña'],
        validate: {
        // This only works on CREATE and SAVE!!!
        validator: function(el) {
            return el === this.contraseña;
        },
        message: 'Las contraseñas no coinciden!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },

    
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('contraseña')) return next();

  // Hash the password with cost of 12
  this.contraseña = await bcrypt.hash(this.contraseña, 12);

  // Delete passwordConfirm field
  this.confirmarContraseña = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

const User = mongoose.model('Usuario', userSchema);
module.exports = User;