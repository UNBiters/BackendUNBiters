const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Like = require('../models/likeModel');

exports.setPublicationUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.publication) req.body.publication = req.params.publicationId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

exports.upsertLike = catchAsync(async (req, res, next) => {
    const userLike = await Like.findOneAndUpdate(req.body, [{$set: {"active": {$not: "$active"}}}], {upsert: true, new: true});
    res.status(200).json({
        status: 'success',
        data: {
            userLike
        }
    });
});

exports.getMyPublicationLike = catchAsync(async (req, res, netx) => {
    const like = await Like.findOne({
        user: req.user.id,
        publication: req.params.publicationId
    });
    let status;
    if (!like) {
        status = false;
    }
    else {
        status = like.active;
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            status
        }
    });
});

// exports.upsert = catchAsync(async (req, res, next) => {
//     const userLike = await Like.findOne({user: req.user.id});
//     if (!userLike) {
//         console.log(req.body)
//         const likeInfo = factory.createOne(Like);

//         console.log(likeInfo)
//     } else {
//         const chaza = await Chaza.findByIdAndUpdate(req.params.chazaId, {$inc: { likes: -1 }});
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             userLike
//         }
//     });  
// })

exports.getLike = factory.getOne(Like);
exports.getAllLikes = factory.getAll(Like);
exports.updateLike = factory.updateOne(Like);
exports.deleteLike = factory.deleteOne(Like);