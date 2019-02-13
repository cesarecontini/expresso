'use strict';
const bcrypt = require('bcrypt');

module.exports = {
    up: (queryInterface, Sequelize) => {
        const hash = bcrypt.hashSync('password', 10);

        return queryInterface.bulkInsert('Users', [{
            firstName: 'James',
            lastName: 'Bond',
            email: 'jamesbond@somedomain.com',
            password: hash,
            token: 'token',
            createdAt : new Date(),
            updatedAt : new Date()
        }], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};