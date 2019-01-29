const capitalize = require('capitalize');
const pluralize = require('pluralize');

module.exports = (opts) => {

    const pluralModel = capitalize(pluralize.plural(opts.modelName));

    return `
'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('${pluralModel}', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('${pluralModel}');
    }
};
`;
}