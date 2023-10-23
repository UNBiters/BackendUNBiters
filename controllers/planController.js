const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Plan = require('../models/planModel');

const epayco = require('epayco-sdk-node')({
    apiKey: process.env.EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
    lang: 'ES',
    test: true
});


// Hacer esto con local Storage
// Hay unos valores de id_plan que no deja por alguna razón. (Pro, Premium,)
exports.createPlan = catchAsync(async (req, res, next) => {
    const createdPlan = await Plan.create(req.body);
    const plan = await epayco.plans.create(createdPlan);
    
    res.status(201).json({
        status: 'success',
        data: {
          plan
        }
    });
});

exports.getPlan = catchAsync(async (req, res, next) => {
    const plan = await epayco.plans.get(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
          plan
        }
    });
});

// Obtener solo los planes que no esten cancelados? Esto se renderiza?
exports.getAllPlans = catchAsync(async (req, res, next) => {
    const plans = await epayco.plans.list()
    res.status(200).json({
        status: 'success',
        data: {
          plans
        }
    });
});

exports.deletePlan = catchAsync(async (req, res, next) => {
    await Plan.findOneAndUpdate({id_plan: req.params.id}, {status: 'cancelado'});
    const plan = await epayco.plans.delete(req.params.id)
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});

