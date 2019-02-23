const capitalize = require('capitalize');
const pluralize = require('pluralize');

module.exports = opts => {
    const pluralModel = capitalize(pluralize.plural(opts.modelName));
    const singularModel = capitalize(pluralize.singular(opts.modelName));

    return `
'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('${pluralModel}', [{
            name: 'a ${singularModel} data test record',
            createdAt : new Date(),
            updatedAt : new Date()
        }], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('${pluralModel}', null, {});
    }
};
`;
};
