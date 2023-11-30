const algoliasearch = require('algoliasearch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Chaza = require('../models/chazaModel');
const Publication = require('../models/publicationModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Like = require('../models/likeModel');
const Customer = require('../models/customerModel');
const Subscription = require('../models/subscriptionModel');
const Plan = require('../models/planModel');

dotenv.config({path: '../config.env'});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );

mongoose
  .connect(DB)
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful!');
});

// Connect and authenticate with your Algolia app
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_API_KEY);

const indexChaza = client.initIndex('chazas');
const indexPublication = client.initIndex('publication');

const loadDataToAlgolia = catchAsync(async (data) => {  
    try {
        await indexPublication.saveObjects(data, {autoGenerateObjectIDIfNotExist: true})
        console.log('Publicaciones cargadas en Algolia');
    } catch (error) {
        console.error('Error al cargar publicaciones en Algolia:', error);
    }
})
  

const updateAlgoliaIndex = catchAsync(async () => {
    try {
      // Limpiar el índice
      await indexPublication.clearObjects();
      console.log('Índice limpiado');
  
      // Recuperar documentos de MongoDB
      const publications = await Publication.find({}).populate({ path: 'reviews' });
      // Cargar en Algolia
      loadDataToAlgolia(publications);
    } catch (err) {
      console.error('Error:', err);
    }
})

updateAlgoliaIndex();