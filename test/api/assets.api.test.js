const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../../lib/app');

const assert = chai.assert;

chai.use(chaiHttp);

// connect to mongodb
process.env.DB_URI = 'mongodb://localhost:27017/assets-REST';
require('../../lib/connection');

describe('assets REST API', () => {

    before(() => mongoose.connection.dropDatabase());
    const request = chai.request(app);

    // test data
    let testAsset0 = {
        asset_type: 'House',
        model: 'Victorian',
        purchase_price: 600000
    };
    let testAsset1 = {
        asset_type: 'Vehicle',
        model: 'Moped',
        purchase_price: 1000
    };

    function saveAsset (asset) {
        return request.post('/assets')
            .send(asset)
            .then(res => res.body);
    }

    it('returns a list of assets', () => {
        return Promise.all([
        // Save test assets
            saveAsset(testAsset0),
            saveAsset(testAsset1)
        ])
        .then(savedAssets => {
            testAsset0 = savedAssets[0];
            testAsset1 = savedAssets[1];
        })
        // Test to see if GET all gets all previously saved assets
        .then(() => request.get('/assets'))
        .then(res => { 
            const assets = res.body;
            assert.deepEqual(assets, [testAsset0, testAsset1]);
        });
    });

});
