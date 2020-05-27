const request = require('supertest');
const { expect } = require('chai');

const server = require('../app');

describe('App', function() {
    after(function() {
        server.close();
    });

    it('should return the running message for the default route', function(done) {
        request(server).post('/login').expect(200).end(function(error, response) {
            console.dir(response);
            // expect(response.text).to.contain('Successfully logged in');
            done();
        });
    });
});