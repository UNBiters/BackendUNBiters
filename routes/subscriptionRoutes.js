const express = require('express');
const authController = require('./../controllers/authController');
const customerController = require('./../controllers/customerController');
const planController = require('./../controllers/planController');
const subscribeController = require('./../controllers/subscribeController');

const router = express.Router();

// CUSTOMERS:

router
.route('/customer')
  .get(authController.protect, authController.restrictTo('admin'), customerController.getAllCustomers)
  .post(authController.protect, customerController.createToken, customerController.createCustomer);
  
  

router
.route('/customer/:id')
  .get(authController.protect, authController.restrictTo('admin'), customerController.getCustomer)
  .patch(authController.protect, authController.restrictTo('admin'), customerController.updateCustomer)
  .delete(authController.protect, authController.restrictTo('admin'), customerController.deleteCustomer)

router
.post('/addTokenCustomer/:id', 
  authController.protect, 
  customerController.createToken,
  customerController.addNewTokenCustomer);

router
.post('/addTokenCard/:id', 
  authController.protect,
  customerController.createToken, 
  customerController.addNewTokenCard);

// PLANS:

router
.route('/plan')
  .get(planController.getAllPlans)
  .post(authController.protect, authController.restrictTo('admin'), planController.createPlan);

router
.route('/plan/:id')
  .get(planController.getPlan)
  .patch(authController.protect, authController.restrictTo('admin'), planController.deletePlan);

// SUBSCRIPTIONS:

router
.route('/subscription/:idPlan')
  .post(authController.protect, subscribeController.createToken, subscribeController.subscribe)

router
.route('/subscription/:id')
  .get(authController.protect, subscribeController.getSubscription)
  .patch(authController.protect, subscribeController.cancelSubscription);

router.get('/subscription', authController.protect, authController.restrictTo('admin'), subscribeController.getAllSubscriptions);
  
router.get('/mySubscription', authController.protect, subscribeController.getMySubscriptions);

router.post('/paySubscription/:idPlan', authController.protect, subscribeController.createToken, subscribeController.paySubscription);


module.exports = router;