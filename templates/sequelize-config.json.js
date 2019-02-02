'use strict';

module.exports = (opts) => {

    return `
{
    "development": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "${opts.dbDialect}"
    },
    "test": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "${opts.dbDialect}"
    },
    "production": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "${opts.dbDialect}"
    }
}   
`;
}