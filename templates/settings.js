'use strict';

module.exports = (opts) => {

    return `
module.exports = {
    port: ${opts.port},
    dbDialect: '${opts.dbDialect}',
    dbConnectionString: process.env.DATABASE_URL,

    jwtSecret: process.env.JWT_SECRET,

    recordsPerPage: 50,
    excludedAttributes: ['createdAt', 'updatedAt'],
    excludedUserAttributes: ['createdAt', 'updatedAt', 'token', 'password']
}    
`;
}