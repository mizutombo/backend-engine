const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;

const app = require('../../lib/app');
const mongoose = require('mongoose');

process.env.DB_URI = 'mongodb://localhost:27017/user-api-test';
require('../../lib/connection');

const request = chai.request(app);

describe.only('admin api tests : ', () => {
    
    before(() => mongoose.connection.dropDatabase());

    const admin = {
        username: 'admin',
        password: 'supersekritadminpassword'
    };

    describe('admin capability tests : ', () => {

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

        const zapAsset1 = {
            asset_type: 'House',
            model: 'Mansion',
            purchase_price: 1600000
        };

        let zapAsset2 = {
            asset_type: 'House',
            model: 'Craftsman',
            purchase_price: 400000
        };

        function saveAsset(asset) {
            return request
                .post('/user/admin/assets')
                .send(asset)
                .then(res => res.body);
        }
        
        it('admin patch updates an asset', () => {
            const url = '/user/admin/assets';
            return request
                .post('/user/admin/signup')
                .send(admin)
                .then(res => res.body.token)
                .then(token => {
                    console.log(token);
                    zapAsset1.purchase_price = 1300000;
                    return request
                        .patch(url)
                        .send(zapAsset1)
                        .set('Authorization', token);
                })        
                        .then(res => {
                            assert.deepEqual(res.body, zapAsset1);
                            return request
                                .get(url);
                        })
                        .then(res => {
                            assert.deepEqual(res.body, zapAsset1);
                        });
        });
        
        it('admin deletes an asset', () => {
            return request 
               .del(`/user/admin/assets/${zapAsset1._id}`)
               .then(res => {
                   assert.isTrue(res.body.deleted);
               });
        });

    });

});

describe('user api tests : ', () => {
    
    before(() => mongoose.connection.dropDatabase());

    const user = {
        username: 'user',
        password: 'password'
    };

    // const request = chai.request(app);

    describe('user management tests : ', () => {

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

        it('user can delete own account', () => {
            let unhappyUser = {
                username: 'unhappy',
                password: 'abcd'
            };

            return request
                .post('/user/signup')
                .send(unhappyUser)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .delete('/user/me')
                        .set('Authorization', token);
                })
                .then(res => {
                    assert.isOk(res.body.message);
                });  
        });

        it('user can update username', () => {
            let changeUser = {
                username: 'mrbigglesworth',
                password: 'abcd'
            };

            return request
                .post('/user/signup')
                .send(changeUser)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .patch('/user/me/changeAccountInfo')
                        .send({username: 'hungrymonkey'})
                        .set('Authorization', token);
                })
                .then(res => {
                    console.log(res.body.username);
                    assert.equal(res.body.username, 'hungrymonkey');
                });
        });

        it('user can update username and password', () => {
            let changeUser = {
                username: 'mrbigglesworth',
                password: 'abcd'
            };
            
            let userHash = '';
            
            let newHash = '';

            return request
                .post('/user/signup')
                .send(changeUser)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .get('/user/mrbigglesworth')
                        .set('Authorization', token)
                        .then(res => {
                            userHash = res.body.hash;
                            return request
                            .patch('/user/me/changeAccountInfo')
                            .send({password: 'efgh'})
                            .set('Authorization', token)
                            .then(res => newHash = res.body.hash);
                        });
                })
                .then(res => {
                    console.log('NEWHASH', newHash, 'USERHASH', userHash);
                    assert.notEqual(newHash, userHash);
                });
        });
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

        function saveAsset (token, asset) {
            return request
                .post('/assets')
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