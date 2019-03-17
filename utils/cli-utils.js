const validator = require('validator');
const fs = require('fs-extra');

const list = val => {
    if (!val) return [];
    return val
        .split(',')
        .filter(v => v && v.length > 0 && validator.isAlpha(v))
        .map(v => v.toLowerCase())
        .map(v => v.replace(/ /g, ''));
};

const pathExist = path => {
    return fs.pathExists(path).then(exists => {
        if (!exists) {
            throw new Error(
                'You must run this command in an expresso-machine generated project'
            );
        }
        return true;
    });
};

module.exports = {
    list,
    pathExist,
};
