const Validate = require('validate');

const validatorMiddleware = (propertyToValidate, schemaInput) => (
    req,
    res,
    next
) => {
    if (!req.body[propertyToValidate]) {
        res.status(404).send({
            error: 'Object not sent',
        });
        return;
    }

    const schema = new Validate(schemaInput);

    const errors = schema.validate(req.body[propertyToValidate]);
    if (errors.length > 0) {
        const jsonErrors = [];
        for (let i = 0; i < errors.length; i += 1) {
            jsonErrors.push(errors[i].message);
        }
        res.status(422).send({
            errors: jsonErrors,
        });
    } else {
        next();
    }
};

module.exports = validatorMiddleware;
