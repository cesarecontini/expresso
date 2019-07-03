const capitalize = require('capitalize');

const supertestString = (opts) => {

    const pluralRoute = opts.routeNamePlural;
    const singularRoute = opts.routeNameSingular;

return `

const settings = require('../../settings');
const { apiBasePath } = settings;
const request = require('supertest');
const server = require('../../app');

let tokenObject = null;
const loginPath = apiBasePath + '/auth/login'
const apiPath = apiBasePath + '/${pluralRoute}';

beforeAll((done) => {
    const login = {
        email: 'jamesbond@somedomain.com',
        password: 'password'
    };

    request(server)
        .post(loginPath)
        .send(login)
        .end((err, res) => {
            tokenObject = {
                Authorization: 'Bearer ' + res.body.token
            };
            expect(res.status).toBe(200)
            done();
        });
});

describe('Check all ' + apiPath + ' are secured', () => {
    test('Cannot GET ' + apiBasePath + '/${pluralRoute}', () => {
        request(server)
            .get(apiPath)
            .end((err, res) => {
                expect(res.status).toBe(401);
            });
    });

    test('Cannot GET ' + apiBasePath + '/${pluralRoute}/1', () => {
        request(server)
            .get(apiPath + '/1')
            .end((err, res) => {
                expect(res.status).toBe(401);
            });
    });

    test('Cannot POST ' + apiBasePath + '/${pluralRoute}', () => {
        request(server)
            .post(apiPath)
            .end((err, res) => {
                expect(res.status).toBe(401);
            });
    });

    test('Cannot PUT ' + apiBasePath + '/${pluralRoute}/1', () => {
        request(server)
            .put(apiPath + '/1')
            .end((err, res) => {
                expect(res.status).toBe(401);
            });
    });

    test('Cannot DELETE ' + apiBasePath + '/${pluralRoute}/1', () => {
        request(server)
            .delete(apiPath + '/1')
            .end((err, res) => {
                expect(res.status).toBe(401);
            });
    });
    
});

describe('Test ${pluralRoute} endpoints', () => {

    let initialCount = 0;
    let idToDelete;

    test('GET ' + apiBasePath + '/${pluralRoute} is http status 200', (done) => {
        request(server)
            .get(apiPath)
            .set(tokenObject)
            .end((err, res) => {
              
                expect(res.status).toBe(200)
                const body = res.body;
                expect(body.count).toBeTruthy();
                expect(body.pages).toBeTruthy();
                expect(body.result).toBeTruthy();
                expect(Array.isArray(body.result)).toBe(true);
                expect(body.result[0].id).toBe(1);
                expect(body.result[0].name).toBe('a ${capitalize(singularRoute)} data test record');
                initialCount = body.count;
                done();
            });
    });

    test('GET ' + apiBasePath + '/${pluralRoute}/1 is http status 200', (done) => {
        request(server)
            .get(apiPath + '/1')
            .set(tokenObject)
            .end((err, res) => {
                expect(res.status).toBe(200)
                const body = res.body;
                expect(body.id).toBeTruthy();
                expect(body.name).toBeTruthy();
                done();
            });
    });

    test('POST ' + apiBasePath + '/${pluralRoute}/1 is http status 404', (done) => {
        request(server)
            .post(apiPath)
            .set(tokenObject)
            .send({})
            .end((err, res) => {
                expect(res.status).toBe(404);
                done();
            });
    });

    test('POST ' + apiBasePath + '/${pluralRoute} is http status 200', (done) => {
        request(server)
            .post(apiPath)
            .set(tokenObject)
            .send({
                ${singularRoute}: {
                    name: 'cool'
                }
            })
            .end((err, res) => {
                expect(res.status).toBe(200);
                expect(res.body.error).not.toBeTruthy();
                expect(res.body.id).toBeTruthy();
                expect(res.body.name).toBeTruthy();
                initialCount++;
                idToDelete = res.body.id;
                done();
            });
    });

    test('POST ' + apiBasePath + '/${pluralRoute} is http status 200', (done) => {
        request(server)
            .post(apiPath)
            .set(tokenObject)
            .send({
                ${singularRoute}: {
                    name: 'a'.repeat(101)
                }
            })
            .end((err, res) => {
                expect(res.body.errors).toBeTruthy();
                expect(Array.isArray(res.body.errors)).toBe(true);
                expect(res.body.errors.length).toBe(1);
                expect(res.body.errors[0]).toBe('Name length cannot exceed 100 chars');
                done();
            });
    });

    test('POST ' + apiBasePath + '/${pluralRoute} is http status 200', (done) => {
        request(server)
            .post(apiPath)
            .set(tokenObject)
            .send({
                ${singularRoute}: {
                    name: ''
                }
            })
            .end((err, res) => {
                expect(res.body.errors).toBeTruthy();
                expect(Array.isArray(res.body.errors)).toBe(true);
                expect(res.body.errors.length).toBe(1);
                expect(res.body.errors[0]).toBe('Name is a required field');
                done();
            });
    });

    test('GET ' + apiBasePath + '/${pluralRoute} is http status 200 and total count is' + initialCount, (done) => {
        request(server)
            .get(apiPath)
            .set(tokenObject)
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(initialCount).toBe(res.body.count); 
                done();
            });
    });

    test('PUT ' + apiBasePath + '/${pluralRoute} is http status 200', (done) => {
        request(server)
            .put(apiPath + '/' + idToDelete)
            .set(tokenObject)
            .send({
                ${singularRoute}: {
                    name: 'DATA'
                }
            })
            .end((err, res) => {
                expect(res.status).toBe(200)
                const api = res.body;
                expect(api.id).toBe(idToDelete); 
                expect(api.name).toBe('DATA'); 
                done();
            });
    });

    test('DELETE ' + apiBasePath + '/${pluralRoute} is http status 200', (done) => {
        request(server)
            .delete(apiPath + '/' + idToDelete)
            .set(tokenObject)
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toStrictEqual({deleted: 1});
                done();
            });
    });
});

`;

};

module.exports = supertestString;