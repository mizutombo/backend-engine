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
                        assert.equal(res.status, 401);
                        assert.equal(res.response.body.error, 'Unauthorized');
                    }
                )
        );
    });
    
    describe('user during play', () => {

        let testAsset3 = {
        asset_type: 'House',
        model: 'Tiny Home',
        purchase_price: 1000
    };
    
        function saveAsset (asset) {
        return request.post('/assets')
            .send(asset)
            .then(res => res.body);
        }
        

        it('can add assets to user object instance', () => {
            return saveAsset(testAsset3)
                .then(savedAsset3 => {
                testAsset3._id = savedAsset3._id;
                testAsset3.__v = savedAsset3.__v;
                return testAsset3;
            })
            .then((testAsset3) =>
            request 
                .post('/user/user/assets')
                .send({ _id: testAsset3._id })
                .then(res => {
                    console.log('RESPONSE', res.body);
                    assert.equal(res.body.assets.length, 1);
                    assert.deepEqual(res.body.assets[0].asset_name.model, 'Tiny Home');
                })
            );
        });
    });
});