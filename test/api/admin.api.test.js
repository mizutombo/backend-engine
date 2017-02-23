const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;

const app = require('../../lib/app');
const mongoose = require('mongoose');

process.env.DB_URI = 'mongodb://localhost:27017/admin-api-test';
require('../../lib/connection');

describe('admin user', () =>{
    before(() => mongoose.connection.dropDatabase());
    
    const request = chai.request(app);

    describe('admin management', () => {
        const badRequest = (url, data, error) =>
            request
                .post(url)
                .send(data)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, error);
                    }
                );

        it('admin signup requires username', () =>
            badRequest('/user/signup/admin', {password: 'supersekritadminpassword'}, 'username and password must be provided')
        );

        it('admin signup requires password', () =>
            badRequest('user/signup/admin', {username: 'horatio'}, 'username and password must be provided')
        );

        it('admin signup requires username and special admin password', () =>
            badRequest('user/signup/admin', {username: 'horatio', password: 'supersekritadminpassword'}, 'Unauthorized to Create Admin Account')
        );
    });
});

