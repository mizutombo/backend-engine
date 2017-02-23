const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;

const app = require('../../lib/app');
const mongoose = require('mongoose');

process.env.DB_URI = 'mongodb://localhost:27017/user-api-test';
require('../../lib/connection');


describe('user', () => {
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

        it('signin requires username', () => 
            badRequest('/user/signin', { password: 'password' }, 'username and password must be provided')
        );

        it('signin requires password', () => 
            badRequest('/user/signin', { username: 'user' }, 'username and password must be provided')
        );
        
        it('signin with wrong user', () => 
            request
                .post('/user/signin')
                .send({ username: 'bad user', password: user.password })
                .then(
                    () => { throw new Error('status should not be ok');},
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, 'invalid username or password');
                    }
                )
        );
    });
    
    describe('user during play', () => {

        let johnDoe = {
            username: 'johnDoe',
            password: 'abcd'
        };

        let johnDoeToken = '';

        let testAsset3 = {
        asset_type: 'House',
        model: 'Tiny Home',
        purchase_price: 1000
        };
    

        const request = chai.request(app);

        function saveAsset (token, asset) {
        return request.post('/assets')
            .send(asset)
            .set('Authorization', token)
            .then(res => res.body);
        }
        
        it('receives properties to user object on signup', () => {
            return request
                .post('/user/signup')
                .send(johnDoe)
                .then(res => johnDoeToken = res.body.token)
                .then(() => {
                    return request
                        .get(`/user/${johnDoe.username}`)
                        .set('Authorization', johnDoeToken);     
                })
                .then((res) => {
                    assert.ok(res.body.bank_account);
                    assert.equal(res.body.retired, false);
                });
        });

        it('can add assets to user object instance', () => {
            return request
                .post ('/user/signin')
                .send(johnDoe)
                .then(res => {
                    johnDoeToken = res.body.token;
                    return saveAsset(johnDoeToken, testAsset3);
                })
                .then(savedAsset3 => {
                testAsset3._id = savedAsset3._id;
                testAsset3.__v = savedAsset3.__v;
                return testAsset3;
            })
            .then((testAsset3) =>
            request 
                .post('/user/johnDoe/assets')
                .send({ johnDoeToken, _id: testAsset3._id })
                .set('Authorization', johnDoeToken)
                .then(res => {
                    console.log('RESPONSE', res.body);
                    assert.equal(res.body.assets.length, 1);
                    assert.ok(res.body.assets[0].asset_name);
                })
            );
        });
    });
});