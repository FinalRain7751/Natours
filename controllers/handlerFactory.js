const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(
          `No ${Model.modelName.toLowerCase()}s found with this id`,
          404,
        ),
      );
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};

exports.updateOne = (Model, ...allowedFields) => {
  return catchAsync(async (req, res, next) => {
    let updateObj = {};
    if (allowedFields.length === 0) updateObj = req.body;
    else {
      allowedFields.forEach((field) => {
        if (req.body[field]) updateObj[field] = req.body[field];
      });
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, updateObj, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(
          `No ${Model.modelName.toLowerCase()}s found with this id`,
          404,
        ),
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newDoc,
    });
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id || req.user.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No doc found with this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    const filterObj = req.params.tourId ? { tour: req.params.tourId } : {};
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filterObj), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // To display the query process
    // const docs = await features.query.explain();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });
};
