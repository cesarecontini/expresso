'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Users', [{
            firstName: 'James',
            lastName: 'Bond',
            email: 'jamesbond@somedomain.com',
            password: 'password',
            token: 'token',
            createdAt : new Date(),
            updatedAt : new Date()
        }], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};