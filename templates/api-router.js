'use strict';

const capitalize = require('capitalize');

module.exports = (opts) => {

    const modelSingular = capitalize(opts.modelSingularName);

    return `
'use strict';
const express = require('express');
const router = express.Router();
const apiServices = require('../services/apiService');
const validate = require('validate');
const validatorMiddleware = require('../services/validatorService');

const validationSchema = {
    name: {
        type: String,
        required: true,
        length: {max: 10},
        message: {
            type: 'Name must be a string!',
            required: 'Name is a required field',
            length: 'Name length cannot exceed 10 chars',
        }
    }
};

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/', function (req, res) {
    apiServices.findAllAndPaginate(req.query.page, '${modelSingular}')
        .then(recs => res.json(recs))
        .catch(e => res.status(500).send(e.message));    
});

router.get('/:id', function (req, res) {
    apiServices.findOne(req.params.id, '${modelSingular}')
        .then(rec => { 
            if(!rec) return res.status(404).send({});
            res.json(rec);
        })
        .catch(e => res.status(500).send(e.message));    
});

router.post('/', 
    validatorMiddleware('${modelSingular.toLowerCase()}', validationSchema),
    function (req, res) {
        apiServices.createOne(req.body.${modelSingular.toLowerCase()}, '${modelSingular}')
            .then(rec => { 
                if(!rec) return res.status(404).send({});
                res.json(rec);
            })
            .catch(e => res.status(500).send(e.message));  
    });

router.put('/:id', 
    validatorMiddleware('${modelSingular.toLowerCase()}', validationSchema),
    function (req, res) {
        apiServices.updateOne(req.body.${modelSingular.toLowerCase()}, req.body.id, '${modelSingular}')
            .then(rec => { 
                if(!rec) return res.status(404).send({});
                res.json(rec);
            })
            .catch(e => sendErrorMessage(res, 500, e));
    });

router.delete('/:id', function (req, res) {
    apiServices.destroyOne(req.params.id, '${modelSingular}')
        .then(rec => { 
            if(!rec) return res.status(404).send({deleted: 0});
            res.json({deleted: rec});
        })
        .catch(e => sendErrorMessage(res, 500, e));    
});

module.exports = router;
`;
}