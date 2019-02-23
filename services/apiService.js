const validator = require('validator');
const sequelize = require('../db/models');
const settings = require('../settings');

const getSequelizeModel = sequelizeModel => sequelize[sequelizeModel];
const getOffset = (limit, page) => limit * (page - 1);
const getNumeric = (v, defaultValue) =>
    v &&
    validator.isNumeric(v, {
        no_symbols: false,
    })
        ? v
        : defaultValue;

const findAllAndPaginate = (page, sequelizeModel) => {
    const limit = settings.recordsPerPage; // number of records per page
    let offset = 0;
    return getSequelizeModel(sequelizeModel)
        .findAndCountAll()
        .then(data => {
            const pages = Math.ceil(data.count / limit);
            const offsetValue = getOffset(limit, getNumeric(page, 0));
            offset = offsetValue < 0 ? 0 : offsetValue;
            return getSequelizeModel(sequelizeModel)
                .findAll({
                    attributes: {
                        exclude: settings.excludedAttributes,
                    },
                    limit,
                    offset,
                    $sort: {
                        id: 1,
                    },
                })
                .then(recs => {
                    return {
                        result: recs,
                        count: data.count,
                        pages,
                    };
                });
        });
};

const findOne = (id, sequelizeModel) => {
    return getSequelizeModel(sequelizeModel)
        .findOne({
            where: {
                id: getNumeric(id, 0),
            },
            attributes: {
                exclude: settings.excludedAttributes,
            },
        })
        .then(rec => rec);
};

const createOne = (objectToCreate, sequelizeModel) => {
    if (!objectToCreate) {
        return new Promise((resolve, reject) =>
            reject(new Error('Undefined object'))
        );
    }
    return getSequelizeModel(sequelizeModel)
        .create(objectToCreate)
        .then(rec => rec);
};

const updateOne = (objectToUpdate, id, sequelizeModel) => {
    if (!objectToUpdate || !getNumeric(id, null))
        return new Promise((resolve, reject) =>
            reject(new Error('Undefined object'))
        );
    // eslint-disable-next-line no-param-reassign
    delete objectToUpdate.id;
    return getSequelizeModel(sequelizeModel)
        .update(objectToUpdate, {
            where: {
                id,
            },
        })
        .then(() => findOne(id, sequelizeModel));
};

const destroyOne = (id, sequelizeModel) => {
    if (!getNumeric(id, null))
        return new Promise((resolve, reject) =>
            reject(new Error('Undefined object'))
        );
    return getSequelizeModel(sequelizeModel).destroy({
        where: {
            id,
        },
    });
};

module.exports = {
    findAllAndPaginate,
    findOne,
    createOne,
    updateOne,
    destroyOne,
};
