const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;

const app = require('../../lib/app');
const mongoose = require('mongoose');
const connection = require('../../lib/connection');


describe.only('user', () => {
    before(() => mongoose.connection.dropDatabase());

    const user = {
        username: 'user',
        password: 'password'
    };

    const request = chai.request(app);

    describe('user management', () => {

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

        it('signup requires username', () =>
            badRequest('/user/signup', { password: 'password' }, 'username and password must be provided')
        );

        it('signup requires password', () => 
            badRequest('/user/signup', { username: 'username' }, 'username and password must be provided')
        );

        let token = '';

        it('signup', () => 
            request
                .post('/user/signup')
                .send(user)
                .then(res => assert.ok(token = res.body.token))
        );

        it('can\'t use same user name', () => 
                request
                .post('/user/signup')
                .send(user)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, 'username user already exists');
                    }
                )
        );
    });
});