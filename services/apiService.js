'use strict';

const sequelize = require('../db/models');
const settings = require('../settings');
const validator = require('validator');

const getSequelizeModel = (sequelizeModel) => sequelize[sequelizeModel];
const getOffset = (limit, page) => limit * (page - 1); 
const getNumeric = (v, defaultValue) => v && validator.isNumeric(v, {no_symbols: false}) ? v : defaultValue;

module.exports = {
    findAllAndPaginate: (page, sequelizeModel) => {
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
    },
    findOne: (id, sequelizeModel) => {
        return getSequelizeModel(sequelizeModel)
            .findOne({
                where: {id: getNumeric(id, 0)},
                attributes: {exclude: settings.excludedAttributes}
            })
            .then(rec => rec);
    },
    createOne: (objectToCreate, sequelizeModel) => {
        return getSequelizeModel(sequelizeModel)
            .create(sequelizeModel)
            .then(rec => rec);
    }
}