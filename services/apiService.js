'use strict';

const sequelize = require('../db/models');
const settings = require('../settings');
const validator = require('validator');

const getSequelizeModel = (sequelizeModel) => sequelize[sequelizeModel];
const getOffset = (limit, page) => limit * (page - 1); 
const getNumeric = (v, defaultValue) => v && validator.isNumeric(v, {no_symbols: false}) ? v : defaultValue;

const findAllAndPaginate = (page, sequelizeModel) => {
    let limit = settings.recordsPerPage; // number of records per page
    let offset = 0;
    return getSequelizeModel(sequelizeModel)
        .findAndCountAll()
            .then((data) => {
                let pages = Math.ceil(data.count / limit);
                const offsetValue = getOffset(limit, getNumeric(page, 0));
                offset = (offsetValue < 0) ? 0 : offsetValue;
                return getSequelizeModel(sequelizeModel).findAll({
                        attributes: {exclude: settings.excludedAttributes},
                        limit: limit,
                        offset: offset,
                        $sort: {
                            id: 1
                        }
                    })
                    .then((recs) => {
                        return {
                            result: recs,
                            count: data.count,
                            pages: pages
                        };
                    });
        });
};

const findOne = (id, sequelizeModel) => {
    return getSequelizeModel(sequelizeModel)
        .findOne({
            where: {id: getNumeric(id, 0)},
            attributes: {exclude: settings.excludedAttributes}
        })
        .then(rec => rec);
};

const createOne = (objectToCreate, sequelizeModel) => {
    if(!objectToCreate) return new Promise((resolve, reject) => reject(new Error('Undefined object')))
    return getSequelizeModel(sequelizeModel)
        .create(objectToCreate)
        .then(rec => rec);
};

const updateOne = (objectToUpdate, id, sequelizeModel) => {
    if(!objectToUpdate || !getNumeric(id, null)) return new Promise((resolve, reject) => reject(new Error('Undefined object')))
    delete objectToUpdate.id;
    return getSequelizeModel(sequelizeModel)
        .update(objectToUpdate, {
            where: {id: id}
        })
        .then(rec => findOne(id, sequelizeModel));
}

const destroyOne = (id, sequelizeModel) => {
    if(!getNumeric(id, null)) return new Promise((resolve, reject) => reject(new Error('Undefined object')))
    return getSequelizeModel(sequelizeModel)
        .destroy({
            where: {id: id}
        });
}

module.exports = {
    findAllAndPaginate,
    findOne,
    createOne,
    updateOne,
    destroyOne
};