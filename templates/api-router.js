const getRouterMethod = (method, path) => {
    return `
router.${method}('${path}', function (req, res) {
    res.json({});
})`;
};

module.exports = (opts) => {
    return `
const express = require('express');
const router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

${getRouterMethod('get', '/')}
${getRouterMethod('get', '/:id')}
${getRouterMethod('post', '/')}
${getRouterMethod('put', '/:id')}
${getRouterMethod('delete', '/:id')}

module.exports = router;
`;
}