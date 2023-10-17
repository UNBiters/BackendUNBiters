const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const epayco = require('epayco-sdk-node')({
    apiKey: process.env.EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
    lang: 'ES',
    test: true
}) 

exports.createToken = catchAsync(async(req, res, next) => {
    let credit_info = {
        "card[number]": req.body.cardNumber,
        "card[exp_year]": req.body.expireYear,
        "card[exp_month]": req.body.expireMonth,
        "card[cvc]": req.body.cvc,
        "hasCvv": true //hasCvv: validar codigo de seguridad en la transacción 
    }
    const token = await epayco.token.create(credit_info);

    res.status(201).json({
        status: 'success',
        data: {
          token
        }
    });
        
});


exports.createCustomer = catchAsync(async (req, res, next) => {
    const customer_info = {
        token_card: req.params.token,
        name: req.body.nombre,
        last_name: req.body.apellido, 
        email: req.body.correo,
        default: true,
        //Optional parameters: These parameters are important when validating the credit card transaction
        city: req.body.ciudad,
        address: req.body.direccion,
        phone: req.body.telefono,
        cell_phone: req.body.celular
    }


    const customer = await epayco.customers.create(customer_info);

    res.status(201).json({
        status: 'success',
        data: {
          customer
        }
    });
})

// Hacer esto con local Storage

exports.createPlan = catchAsync(async (req, res, next) => {
    let plan_info = {
        id_plan: req.params.plan,
        name: "Course react js",
        description: "Course react and redux",
        amount: 30000,
        currency: "cop",
        interval: "month",
        interval_count: 1,
        trial_days: 30
    }
    const plan = await epayco.plans.create(plan_info)
    
    res.status(201).json({
        status: 'success',
        data: {
          plan
        }
    });
})


exports.subscribe = catchAsync(async(req, res, next) => {
    var subscription_info = {
        id_plan: "-id_plan",
        customer: req.params.user_id,
        token_card: req.params.token,
        doc_type: "CC",
        doc_number: "5234567",
        //Optional parameter: if these parameter it's not send, system get ePayco dashboard's url_confirmation
        url_confirmation: "https://ejemplo.com/confirmacion",
        method_confirmation: "POST",
    }
    const subscription = await epayco.subscriptions.create(subscription_info)

    res.status(201).json({
        status: 'success',
        data: {
          subscription
        }
    });
})


        