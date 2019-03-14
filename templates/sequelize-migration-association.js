const capitalize = require('capitalize');
const pluralize = require('pluralize');

module.exports = opts => {
    const sourceModelPlural = capitalize(pluralize.plural(opts.sourceModel));
    const targetModelPlural = capitalize(pluralize.plural(opts.targetModel));
    const sourceModelSingular = pluralize.singular(opts.sourceModel);
    const targetModelSingular = pluralize.singular(opts.targetModel);
    const associationType = opts.associationType;

    if (associationType === 'belongsTo') {
        return `
'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            '${sourceModelPlural}', 
            '${targetModelSingular}Id',
            {
                type: Sequelize.INTEGER,
                references: {
                    model: '${targetModelPlural}', 
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            '${sourceModelPlural}', 
            '${targetModelSingular}Id'
        );
    }
};
`;
    } else if (associationType === 'hasOne' || associationType === 'hasMany') {
        return `
'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            '${targetModelPlural}', 
            '${sourceModelSingular}Id',
            {
                type: Sequelize.INTEGER,
                references: {
                    model: '${sourceModelPlural}', 
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            '${targetModelPlural}',
            '${sourceModelSingular}Id'
        );
    }
};
`;
    } else if (associationType === 'belongsToMany') {
        return `
'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
        '${capitalize(sourceModelSingular)}${targetModelPlural}', {
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            ${sourceModelSingular}Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: '${sourceModelPlural}',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            ${targetModelSingular}Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: '${targetModelPlural}',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        });
    },
    down: (queryInterface, Sequelize) => {
        // remove table
        return queryInterface.dropTable('${capitalize(sourceModelSingular)}${targetModelPlural}');
    },
};
`;
    }
};