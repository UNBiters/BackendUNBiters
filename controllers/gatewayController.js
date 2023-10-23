const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Customer = require('../models/customerModel');

const epayco = require('epayco-sdk-node')({
    apiKey: process.env.EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
    lang: 'ES',
    test: true
}) 





        