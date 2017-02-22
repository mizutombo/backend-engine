const Asset = require('../lib/models/asset.model');
const assert = require('chai').assert;
const testInvalid = require('./test-invalid')(Asset);

describe('asset model: ', () => {

    it('requires a purchase price', () => {
        return testInvalid({current_value: '500000'});
    });

    it('requires house or vehicle as type', () => {
        return testInvalid({asset_type: 'Dogs', purchase_price: 500000});
    });
});
