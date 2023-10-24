const algoliasearch = require('algoliasearch');
const catchAsync = require('./../utils/catchAsync');

// Connect and authenticate with your Algolia app
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_API_KEY);

// Create a new index. An index stores the data that you want to make searchable in Algolia.
const indexChaza = client.initIndex('chazas');
const indexPublication = client.initIndex('publication');

exports.uploadChaza = async (chaza) => {
    await indexChaza.saveObjects(chaza, {autoGenerateObjectIDIfNotExist: true});
};

exports.uploadPublication = async (publication) => {
    await indexPublication.saveObjects(publication, {autoGenerateObjectIDIfNotExist: true});
};

exports.searchChaza = catchAsync(async (req, res, next) => {
    const chaza = await indexChaza.search(req.body.filter);
    res.status(200).json({
        status: 'success',
        data: {
            data: chaza
        }
    });
});

exports.searchPublication = catchAsync(async (req, res, next) => {
    const publication = await indexPublication.search(req.body.filter);
    res.status(200).json({
        status: 'success',
        data: {
            data: publication
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






