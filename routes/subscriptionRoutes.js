const express = require('express');
const gatewayController = require('../controllers/gatewayController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Hacer delete me, update me poner restriccion de administradores. 

// Publicaciones:
// Primer paso:
router
  .route('/createToken')
  .post(gatewayController.createToken);
  
// Segundo paso: 
router
  .route('/createCustomer/:token')
  .post(gatewayController.createCustomer);

// Tercer paso:
  router
  .route('/subscribe')
  .post(gatewayController.subscribe);

  
  
module.exports = router;