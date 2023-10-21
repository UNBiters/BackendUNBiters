const algoliasearch = require('algoliasearch');
const Chaza = require('../models/chazaModel');
const catchAsync = require('./../utils/catchAsync');

// Connect and authenticate with your Algolia app
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_API_KEY);

// Create a new index. An index stores the data that you want to make searchable in Algolia.
const index = client.initIndex('chazas');

exports.uploadChaza = async (chaza) => {
    await index.saveObjects(chaza, {autoGenerateObjectIDIfNotExist: true});
};

exports.searchChaza = catchAsync(async (req, res, next) => {
    const chaza = await index.search(req.body.filter);
    res.status(200).json({
        status: 'success',
        data: {
            data: chaza
        }
    });
});


// (async() => {
//     try {
//         
        
//     } catch (err) {
//         console.error(err);
//     }
// }
// )();






