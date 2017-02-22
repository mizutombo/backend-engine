const mongoose = require('mongoose');
const assert = require('chai').assert;

const User = require('../lib/models/user.model');
const updater = require('../lib/update-user');

describe('update-user function', () => {
    let dummyUser = new User({
        username: 'Testy',
        hash: '$2a$08$F5f7nZtejb5o6N6kZ.XAP.kGlWCGoCnkOAgavSO/xd8LQq121wyEy',
        age: 18,
        original_signup: '2016-02-10T00:48:31.406Z'
    });

    it('updates the age after one game year', () => {
        dummyUser = updater(new Date('2016-02-23'), dummyUser);
        assert.equal(dummyUser.age, 19);
    });

});