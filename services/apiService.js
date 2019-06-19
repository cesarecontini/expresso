
const sequelize = require('../db/models');
const settings = require('../../settings');

const getSequelizeModel = sequelizeModel => sequelize[sequelizeModel];
const getOffset = (limit, page) => limit * (page - 1);

const getNumeric = (v, defaultValue) => {
    const numericValue = parseInt(v);
    if(Number.isInteger(numericValue)) {
        return numericValue;
    } else {
        return defaultValue;
    }
}

const getAttributes = attributes => attributes ? attributes : {
    exclude: settings.excludedAttributes,
};

const getWhere = (where, defaultOpt = {}) => where ? where : defaultOpt;

const findAllAndPaginate = (page, sequelizeModel, attributes, where, sort, include = []) => {

    const attributesOption = getAttributes(attributes);
    const whereOption = getWhere(where);
    const sortOption = sort ? sort : {
        id: 1,
    };

    const limit = settings.recordsPerPage; // number of records per page
    let offset = 0;

    return getSequelizeModel(sequelizeModel)
        .findAndCountAll({
            attributes: attributesOption,
            where: whereOption
        })
        .then(data => {
            const pages = Math.ceil(data.count / limit);
            const offsetValue = getOffset(limit, getNumeric(page, 0));
            offset = offsetValue < 0 ? 0 : offsetValue;
            return getSequelizeModel(sequelizeModel)
                .findAll({
                    attributes: attributesOption,
                    limit,
                    offset,
                    where: whereOption,
                    $sort: sortOption,
                    include: include
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

const findOne = (id, sequelizeModel, attributes, where, include = []) => {
    return getSequelizeModel(sequelizeModel)
        .findOne({
            where: getWhere(where, {
                id: getNumeric(id, 0),
            }),
            include: include,
            attributes: getAttributes(attributes),
        })
        .then(rec => {
            return rec;
        });
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

const updateOne = (objectToUpdate, id, sequelizeModel, attributes, where) => {

    if (!objectToUpdate || !id) {
        return new Promise((resolve, reject) =>
            reject(new Error('Undefined object'))
        );
    }

    const whereOption = getWhere(where, {
        id: id
    });

    return getSequelizeModel(sequelizeModel)
        .update(objectToUpdate, {
            where: whereOption,
        })
        .then(() => {
            return findOne(id, sequelizeModel, attributes);
        });
};

const destroyOne = (id, sequelizeModel, where) => {
    const numericId = parseInt(id);
    if (!Number.isInteger(numericId)) {
        return new Promise((resolve, reject) =>
            reject(new Error('Undefined object'))
        );
    }

    const whereMerged = Object.assign({
        id: parseInt(numericId)
    }, where);
       
    return getSequelizeModel(sequelizeModel).destroy({
        where: whereMerged
    });
};

module.exports = {
    getSequelizeModel,
    findAllAndPaginate,
    findOne,
    createOne,
    updateOne,
    destroyOne,
};
