'use strict';

module.exports = (opts) => {

    return `
module.exports = {
    port: ${opts.port},
    dbDialect: '${opts.dbDialect}',
    dbConnectionString: process.env.DATABASE_URL,

    recordsPerPage: 50,
    excludedAttributes: ['createdAt', 'updatedAt', 'token', 'password']
}    
`;
}