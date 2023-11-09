const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Subscription = require('../models/subscriptionModel');
const Customer = require('../models/customerModel');
const User = require('../models/userModel');

const epayco = require('epayco-sdk-node')({
    apiKey: process.env.EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
    lang: 'ES',
    test: true
});

exports.createToken = catchAsync(async(req, res, next) => {
    let credit_info = {
        "card[number]": req.body.cardNumber,
        "card[exp_year]": req.body.cardExpYear,
        "card[exp_month]": req.body.cardExpMonth,
        "card[cvc]": req.body.cardCvc,
        "hasCvv": true //hasCvv: validar codigo de seguridad en la transacción 
    }
    const token = await epayco.token.create(credit_info);
    console.log(token)
    req.body.token_card = token.id
    next();
});

// Obtener id_plan, id_customer y id_token de la url o del local storage, primero debe ser cliente

exports.subscribe = catchAsync(async (req, res, next) => {
    const cliente = await Customer.findOne({user: req.user.id}, 'customerId');
    if (!cliente) {
        return new AppError('No se encontro el cliente asociado a esta cuenta', 404);
    }
    if (!req.body.customer) req.body.customer = cliente.customerId;
    if (!req.body.id_plan) req.body.id_plan = req.params.idPlan;
    if (!req.body.user) req.body.user = req.user.id;

    const mySub = await Subscription.find({user: req.user.id});

    if (mySub.status == 'activa' || mySub.status == 'inactiva') {
        return new AppError('Ya esta en un plan, cancela la suscripción si quieres suscribirte a nuevos planes', 400);
    }
    const subscription = await epayco.subscriptions.create(req.body);
    req.body.subscriptionId = subscription.id
    await Subscription.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            subscription
        }
    });
});

exports.getSubscription = catchAsync(async (req, res, next) => {
    const subscription = await epayco.subscriptions.get(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            subscription
        }
    });
});

exports.getAllSubscriptions = catchAsync(async (req, res, next) => {
    const subscriptions = await epayco.subscriptions.list();
    res.status(200).json({
        status: 'success',
        data: {
            subscriptions
        }
    });
});

exports.getMySubscriptions = catchAsync(async (req, res, next) => {
    const sub = await Subscription.findOne({user: req.user.id});
    const subscription = await epayco.subscriptions.get(sub.subscriptionId);
    res.status(200).json({
        status: 'success',
        data: {
            subscription
        }
    });
});

exports.cancelSubscription = catchAsync(async (req, res, next) => {
    const subscription = await epayco.subscriptions.cancel(req.params.id);
    await Subscription.findOneAndUpdate({user: req.user.id}, {status: 'cancelada'});
    await User.findByIdAndUpdate(req.user.id, {
        nivelSuscripcion: 0
    })
    res.status(200).json({
        status: 'success',
        data: {
            subscription
        }
    });
});

// Si ya existe una suscripción en determinado plan, pero esta inactiva no puedo pagar una suscripción a otro plan, debo primero
// cancelar la suscripción.

exports.paySubscription = catchAsync(async (req, res, next) => {
    const cliente = await Subscription.findOne({user: req.user.id}, 'customer');
    if (!cliente) {
        return new AppError('No se encontro el cliente asociado a esta cuenta', 404);
    }

    // Obtener ip publica del cliente.
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

    if (!req.body.customer) req.body.customer = cliente.customer;
    if (!req.body.id_plan) req.body.id_plan = req.params.idPlan;
    if (!req.body.ip) req.body.ip = ip;
    
    console.log(req.body)
    const subscription = await epayco.subscriptions.charge(req.body);
    await Subscription.findOneAndUpdate({user: req.user.id}, {status: "activa"});

    res.status(200).json({
        status: 'success',
        data: {
            subscription
        }
    });
});