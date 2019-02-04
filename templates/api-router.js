'use strict';

const capitalize = require('capitalize');

const findAllAndPaginateImpl = (modelSingularName) => {
return `
    apiServices.findAllAndPaginate(req, '${capitalize(modelSingularName)}')
        .then(recs => res.json(recs))
        .catch(e => res.status(500).send(e.message));    
`;
};

const getRouterMethod = (method, path, impl = 'res.json({});') => {
    return `
router.${method}('${path}', function (req, res) {
    ${impl}
});`;
};

module.exports = (opts) => {
    return `
const express = require('express');
const router = express.Router();
const apiServices = require('../services/apiService');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

${getRouterMethod('get', '/', findAllAndPaginateImpl(opts.modelSingularName))}
${getRouterMethod('get', '/:id')}
${getRouterMethod('post', '/')}
${getRouterMethod('put', '/:id')}
${getRouterMethod('delete', '/:id')}

module.exports = router;
`;
}