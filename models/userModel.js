const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'Por favor dinos tu nombre!']
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
    chaza: Boolean,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    nivelSuscripcion: {
      type: Number,
      default: 0
    }
}, {timestamps: true});

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
  if (!this.isModified('contraseña') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
  });

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
};

const User = mongoose.model('User', userSchema, "usuarios");
module.exports = User;