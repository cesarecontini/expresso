module.exports = opts => {
    return `module.exports = {
    port: process.env.PORT,
    dbDialect: '${opts.dbDialect}',
    dbConnectionString: process.env.DATABASE_URL,

    apiBasePath: process.env.API_BASE_PATH,

    jwtSecret: process.env.JWT_SECRET,
    jwtIssuer: process.env.JWT_ISSUER,
    jwtAudience: process.env.JWT_AUDIENCE,

    enableJwtAuthentication: true,

    recordsPerPage: 50,
    excludedAttributes: ['createdAt', 'updatedAt'],
    excludedUserAttributes: ['createdAt', 'updatedAt', 'token', 'password'],
};
`;
};
