const algoliasearch = require('algoliasearch');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.deleteDocuments = catchAsync(async (Model, mongoId) => {
    try {
        let searchResponse;
        // Reemplaza 'mongodbId' con el id de MongoDB que quieres buscar
        if (Model == "Chaza") searchResponse = await indexChaza.search(mongoId);
        else if (Model == "Publication") searchResponse = await indexPublication.search(mongoId)

        if (searchResponse.hits.length > 0) {
            // Si se encuentra el hit, obtenemos el objectID
            const object_id_to_delete = searchResponse.hits[0].objectID;
            if (Model == "Chaza") await indexChaza.deleteObject(object_id_to_delete);
            else if (Model == "Publication") await indexPublication.deleteObject(object_id_to_delete);
        } else {
            throw new AppError("No se encontro ningun documento asociado al id dado", 404);
        }
    } catch (err) {
        console.error('Error al buscar o eliminar el documento:', err);
    }
    
});

exports.updateDocuments = catchAsync(async (Model, mongoId, updatedData) => {
    try {
        let searchResponse;
        // Reemplaza 'mongodbId' con el id de MongoDB que quieres buscar
        if (Model == "Chaza") searchResponse = await indexChaza.search(mongoId);
        else if (Model == "Publication") searchResponse = await indexPublication.search(mongoId)

        if (searchResponse.hits.length > 0) {
            // Si se encuentra el hit, obtenemos el objectID
            const object_id_to_update = searchResponse.hits[0].objectID;

            // Actualiza el documento usando el objectID
            if (Model == "Chaza") {
                await indexChaza.partialUpdateObject({
                    ...updatedData,
                    objectID: object_id_to_update
                });
            } else if (Model == "Publication") {
                await indexPublication.partialUpdateObject({
                    ...updatedData,
                    objectID: object_id_to_update
                });
            }

        } else {
            throw new AppError("No se encontro ningun documento asociado al id dado", 404);
        }
    } catch (err) {
        console.error('Error al buscar o actualizar el documento:', err);
    }
})

// (async() => {
//     try {
//         
        
//     } catch (err) {
//         console.error(err);
//     }
// }
// )();






