const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Customer = require('../models/customerModel');

const epayco = require('epayco-sdk-node')({
    apiKey: process.env.EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
    lang: 'ES',
    test: true
}) 

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
    req.params.token = token.id
    next();
});

// CUSTOMERS:

// Create a customer.

exports.createCustomer = catchAsync(async (req, res, next) => {
    const customerInfo = {
        token_card: req.params.token,
        name: req.body.name,
        last_name: req.body.last_name, 
        email: req.body.email,
        default: true,
        //Optional parameters: These parameters are important when validating the credit card transaction
        city: req.body.city,
        address: req.body.address,
        phone: req.body.phone,
        cell_phone: req.body.cell_phone
    }

    const customer = await epayco.customers.create(customerInfo);

    const {
        name, 
        email, 
        city, 
        address, 
        phone, 
        cell_phone} = customerInfo;
    
    const clienteInfo = {
        name, 
        email, 
        city, 
        address, 
        phone, 
        cell_phone,
        user: req.user.id,
        customerId: customer.data.customerId
    }

    await Customer.create(clienteInfo);

    res.status(201).json({
        status: 'success',
        data: {
          customer
        }
    });
})

// Get customer:

exports.getCustomer = catchAsync(async (req, res, next) => {
    // const cliente = await Customer.findOne({user: req.user.id});
    // if (!cliente) {
    //     return new AppError('No se encontro el cliente con el Id dado', 404);
    // }
    const customer = await epayco.customers.get(req.params.id);
    // No es un error no encontrar un cliente
    res.status(200).json({
        status: 'success',
        data: {
          customer
        }
    });
})

exports.getAllCustomers = catchAsync(async (req, res, next) => {
    const customers = await epayco.customers.list();
    res.status(200).json({
        status: 'success',
        data: {
          customers
        }
    });

})

exports.updateCustomer = catchAsync(async (req, res, next) => {
    const updatedCustomer = await epayco.customers.update(req.params.id, req.body)
    await Customer.findOneAndUpdate({customerId: req.params.id}, req.body, {new: true, runValidators: true});
    res.status(200).json({
        status: 'success',
        data: {
          updatedCustomer
        }
    });
})

exports.deleteCustomer = catchAsync(async (req, res, next) => {
    if (!req.body.customerId) req.body.customer_id = req.params.id
    const customer = await epayco.customers.delete(req.body)

    res.status(204).json({
        status: 'success',
        data: {
            customer
        }
    });
});

// Esta funcionalidad solo aplica si createToken fuera una ruta por si sola, ya que quedarian tokens vagando sin ningun usuario asociado.

exports.addNewTokenCustomer = catchAsync(async (req, res, next) => {
    if (!req.body.customerId) req.body.customer_id = req.params.id
    if (!req.body.token_card) req.body.token_card = req.params.token

    const customer = await epayco.customers.addNewToken(req.body)
    res.status(200).json({
        status: 'success',
        data: {
            customer
        }
    });
})

exports.addNewTokenCard = catchAsync(async (req, res, next) => {
    if (!req.body.customerId) req.body.customer_id = req.params.id
    if (!req.body.token) req.body.token = req.params.token
    // console.log(req.body)
    const customer = await epayco.customers.addDefaultCard(req.body)
    res.status(200).json({
        status: 'success',
        data: {
            customer
        }
    });
})
