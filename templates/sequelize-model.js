const capitalize = require('capitalize');
const pluralize = require('pluralize');

module.exports = (opts) => {

    const singularModel = capitalize(pluralize.singular(opts.modelName));

    return `
'use strict';
module.exports = (sequelize, DataTypes) => {
    const ${singularModel} = sequelize.define('${singularModel}', {
        name: DataTypes.STRING
    }, {});
    ${singularModel}.associate = function (models) {
        // associations can be defined here
    };
    return ${singularModel};
};
`;
}