const capitalize = require('capitalize');

module.exports = opts => {
    const modelSingular = capitalize(opts.modelSingularName);

    return `
const express = require('express');

const router = express.Router();
const apiServices = require('../services/apiService');
const validatorMiddleware = require('../services/validatorService');

const validationSchema = {
    name: {
        type: String,
        required: true,
        length: {
            max: 10,
        },
        message: {
            type: 'Name must be a string!',
            required: 'Name is a required field',
            length: 'Name length cannot exceed 10 chars',
        },
    },
};

// middleware that is specific to this router
router.use((req, res, next) => {
    next();
});

router.get('/', (req, res) => {
    apiServices
        .findAllAndPaginate(req.query.page, '${modelSingular}')
        .then(recs => res.json(recs))
        .catch(e => res.status(500).send(e.message));
});

router.get('/:id([0-9]+)', (req, res) => {
    apiServices
        .findOne(req.params.id, '${modelSingular}')
        .then(rec => {
            if (!rec) {
                res.status(404).send({});
                return;
            }
            res.json(rec);
        })
        .catch(e => res.status(500).send(e.message));
});

router.post('/', validatorMiddleware('${modelSingular.toLowerCase()}', validationSchema), (req, res) => {
    
    const ${modelSingular.toLowerCase()} = req.body.${modelSingular.toLowerCase()};
    
    apiServices
        .createOne(${modelSingular.toLowerCase()}, '${modelSingular}')
        .then(rec => {
            if (!rec) {
                res.status(404).send({});
                return;
            }
            res.json(rec);
        })
        .catch(e => res.status(500).send(e.message));
});

router.put('/:id([0-9]+)',  validatorMiddleware('${modelSingular.toLowerCase()}', validationSchema), (req, res) => {

    const ${modelSingular.toLowerCase()} = req.body.${modelSingular.toLowerCase()};

    apiServices
        .updateOne(${modelSingular.toLowerCase()}, req.params.id, '${modelSingular}')
        .then(rec => {
            if (!rec) {
                res.status(404).send({});
                return;
            }
            res.json(rec);
        })
        .catch(e => res.status(500).send(e.message));
});    

router.delete('/:id([0-9]+)', (req, res) => {
    apiServices
        .destroyOne(req.params.id, '${modelSingular}')
        .then(rec => {
            if (!rec) {
                res.status(404).send({
                    deleted: 0,
                });
                return;
            }
            res.json({
                deleted: rec,
            });
        })
        .catch(e => res.status(500).send(e.message));
});

module.exports = router;

`;
};
