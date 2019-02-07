'use strict';

const capitalize = require('capitalize');

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

router.get('/', function (req, res) {
    apiServices.findAllAndPaginate(req.query.page, '${opts.modelSingularName}')
        .then(recs => res.json(recs))
        .catch(e => res.status(500).send(e.message));    
});

router.get('/:id', function (req, res) {
    apiServices.findOne(req.params.id, '${opts.modelSingularName}')
        .then(rec => { 
            if(!rec) return res.status(404).send({});
            res.json(rec);
        })
        .catch(e => res.status(500).send(e.message));    
});

router.post('/', function (req, res) {
    apiServices.createOne(req.body.${opts.modelSingularName.toLowerCase()}, '${opts.modelSingularName}')
        .then(rec => { 
            if(!rec) return res.status(404).send({});
            res.json(rec);
        })
        .catch(e => res.status(500).send(e.message));  
});

router.put('/:id', function (req, res) {
    res.json({});
});

router.delete('/:id', function (req, res) {
    res.json({});
});

module.exports = router;
`;
}