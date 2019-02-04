'use strict';

const sequelize = require('../db/models');
const settings = require('../settings');

const getSequelizeModel = (sequelizeModel) => sequelize[sequelizeModel];
const getOffset = (limit, page) => limit * (page - 1); 

module.exports = {
    findAllAndPaginate: (req, sequelizeModel) => {
        let limit = settings.recordsPerPage; // number of records per page
        let offset = 0;
        return getSequelizeModel(sequelizeModel)
            .findAndCountAll()
                .then((data) => {
                let page = (req.query.page) ? req.query.page : 0; // page number
                let pages = Math.ceil(data.count / limit);
                const offsetValue = getOffset(limit, page);
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
    }
}