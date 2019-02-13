const validate = require('validate');

const validatorMiddleware = (propertyToValidate, schemaInput) => (req, res, next) => {

    if(!req.body[propertyToValidate]) return res.status(404).send({error: 'Object not sent'});

    const schema = new validate(schemaInput);
    
    const errors = schema.validate(req.body[propertyToValidate]);
    if(errors.length > 0) {
        let jsonErrors = [];
        for(let i = 0; i < errors.length; i++) {
            jsonErrors.push(errors[i].message);
        }
        res.status(422).send({errors: jsonErrors});
    } else {
        next();
    }
}

module.exports = validatorMiddleware;
