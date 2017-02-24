const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;

const app = require('../../lib/app');
const mongoose = require('mongoose');

process.env.DB_URI = 'mongodb://localhost:27017/admin-api-test';
require('../../lib/connection');

describe.only('admin user', () =>{
    before(() => mongoose.connection.dropDatabase());
    
    const request = chai.request(app);

    describe('admin management', () => {

        const admin = {
        username: 'admin',
        password: 'supersekritadminpassword'
        };
    
        let token = '';
    
        const badRequest = (url, data, error) =>
            request
                .post(url)
                .send(data)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        console.log(res.status);
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, error);
                    }
                );

        const badAdminRequest = (url, data, error) =>
            request
                .post(url)
                .send(data)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        console.log(res.status);
                        assert.equal(res.status, 401);
                        assert.equal(res.response.body.error, error);
                    }
                );

        it('admin signup requires username', () =>
            badRequest('/user/signup/admin', {password: 'supersekritadminpassword'}, 'username and password must be provided')
        );

        it('admin signup requires password', () =>
            badRequest('/user/signup/admin', {username: 'horatio'}, 'username and password must be provided')
        );

        it('admin signup requires username and special admin password', () =>
            badAdminRequest('/user/signup/admin', {username: 'horatio', password: 'notsupersekritadminpassword'}, 'Unauthorized to Create Admin Account')
        );

        it('admin signup', () => 
            request
                .post('/user/signup/admin')
                .send(admin)
                .then(res => assert.ok(token = res.body.token))
        );

        it('can\'t use same user name', () => 
            request
                .post('/user/signup/admin')
                .send(admin)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, 'username admin already exists');
                    }
                )
        );

        it('can create new assets', () => {
            let newAdmin = {
                username: 'newAdmin',
                password: 'supersekritadminpassword'
            };

            let newAsset = {
                asset_type: 'Vehicle',
                model: 'Tricycle',
                purchase_price: 100,
                current_value: 100,
                monthly_appreciation_percentage: 0
            };

            return request
                .post('/user/signup/admin')
                .send(newAdmin)
                .then(res => res.body.token)
                .then((token) => {
                    console.log(token);
                    return request
                    .post('/user/admin/assets')
                    .send(newAsset)
                    .set('Authorization', token);
                })
                .then(res => {
                    assert.equal(res.status, 200);
                });
        });
    });
});

