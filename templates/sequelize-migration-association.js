const capitalize = require('capitalize');
const pluralize = require('pluralize');

module.exports = opts => {
    const sourceModelPlural = capitalize(pluralize.plural(opts.sourceModel));
    const targetModelPlural = capitalize(pluralize.plural(opts.targetModel));
    const targetModelSingular = pluralize.singular(opts.targetModel);

    return `
'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            '${sourceModelPlural}', // name of Source model
            '${targetModelSingular}Id', // name of the key we're adding
            {
                type: Sequelize.INTEGER,
                references: {
                    model: '${targetModelPlural}', // name of Target model
                    key: 'id', // key in Target model that we're referencing
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            '${sourceModelPlural}', // name of Source model
            '${targetModelSingular}Id' // key we want to remove
        );
    }
};
`;
};