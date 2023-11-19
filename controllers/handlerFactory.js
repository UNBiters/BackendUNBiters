const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const searchController = require("./searchController");
const slugify = require("slugify");
const cloudinary = require("cloudinary");
const fs = require("fs-extra");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        
        if (!doc) {
            return next(new AppError("No se encontro ningun documento asociado al ID dado", 404));
        }

        if (search && Model.modelName == "Chaza") searchController.deleteDocuments("Chaza", req.params.id);
        if (search && Model.modelName == "Publication") searchController.deleteDocuments("Publication", req.params.id);

        res.status(204).json({
            status: "success",
            data: null,
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError("No se encontro ningun documento asociado al ID dado", 404));
        }

        if (search && Model.modelName == "Chaza") searchController.updateDocuments("Chaza", req.params.id, req.body);
        if (search && Model.modelName == "Publication") searchController.updateDocuments("Publication", req.params.id, req.body);

        if (req.body.nombre && Model.modelName == "Chaza") {
            doc.slug = slugify(String(req.body.nombre), { lower: true });
        }

        res.status(200).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

exports.createOne = (Model, search = false) =>
    catchAsync(async (req, res, next) => {
        

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path);
            //console.log(result)
            req.body.imagenUrl = result.secure_url;
            req.body.imagenId = result.public_id;
            await fs.unlink(req.file.path);
        }
        //esto deber ir logica del frontend
        if (req.body.tag) {
            req.body.tags = JSON.parse(req.body.tags);
        }

        const doc = await Model.create(req.body);

        if (search && Model.modelName == "Chaza") searchController.uploadChaza([doc]);
        if (search && Model.modelName == "Publication") {
            searchController.uploadPublication([doc]);
        }

        res.status(201).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        console.log(req.params.id);
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

exports.getOnes = (Model, field, popOptions) =>
    catchAsync(async (req, res, next) => {
        console.log({ [field]: req.params.id });
        let query = Model.find({ [field]: req.params.id });
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError("Ningun documento se encontro con ese Id", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

exports.getAll = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let filter = {};
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // const doc = await features.query.explain();
        if (popOptions) features.query.populate(popOptions);
        const doc = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: "success",
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });

exports.getAllNames = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let filter = {};

        const query = Model.find(filter);

        query.select("nombre");
        const features = new APIFeatures(query, req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // const doc = await features.query.explain();
        if (popOptions) features.query.populate(popOptions);
        const doc = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: "success",
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });
