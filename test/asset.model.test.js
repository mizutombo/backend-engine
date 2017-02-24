const Asset = require('../lib/models/asset.model');
const assert = require('chai').assert;
const testInvalid = require('./test-invalid')(Asset);

let testAsset = { // all required values & correct data types
    asset_type: 'House',
    model: 'mansion',
    purchase_price: 1500000
}; 

describe('asset model : ', () => {

    it('requires a purchase_price', () => {
        return testInvalid({  // missing current_value
            asset_type: 'House',
            model: 'tri-level',
            current_value: 500000
        });
    });

    it('requires \'House\' or \'Vehicle\' as asset_type', () => {
        return testInvalid({  // inject incorrect asset_type
            asset_type: 'Home', 
            model: 'cabin',
            purchase_price: 100000
        });
    });

    it('requires model for house or vehicle asset', () => {
        return testInvalid({  // missing model for asset
            asset_type: 'Vehicle',
            purchase_price: 75000
        });
    });

    it('validation passes with all required values', () => {
        return new Asset(testAsset)
            .validate();
    });

    it('fails when wrong data type is used', () => {
        return testInvalid({  // injecting purchase_price incorrectly as String
            asset_type: 'Vehicle',
            model: 'BMW 325i',
            purchase_price: '$45,0000'
        });
    });

});
