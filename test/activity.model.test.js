const Activity = require('../lib/models/activity.model');
const assert = require('chai').assert;

const testInvalid = require('./test-invalid')(Activity);

describe('activity model', () => {

    let testActivity = {
        name: 'Go out for a fancy dinner',
        purchasePrice: 100,
        rewardOdds: 20,
        rewardAmount: 5000,
        rewardMessage: 'You won $5000!'
    };

    it('validation fails without a name value', () => {
        return testInvalid({
            purchasePrice: 100,
            rewardOdds: 20,
            rewardAmount: 5000,
            rewardMessage: 'You won $5000!'
        });
    });

    it('validation fails without a purchasePrice value', () => {
        return testInvalid({
            name: 'Go out for a fancy dinner',
            rewardOdds: 20,
            rewardAmount: 5000,
            rewardMessage: 'You won $5000!'
        });
    });

    it('validation fails without a rewardsOdds value', () => {
        return testInvalid({
            name: 'Go out for a fancy dinner',
            purchasePrice: 100,
            rewardAmount: 5000,
            rewardMessage: 'You won $5000!'
        });
    });

    it('validation fails without a rewardsAmount value', () => {
        return testInvalid({
            name: 'Go out for a fancy dinner',
            purchasePrice: 100,
            rewardOdds: 20,
            rewardMessage: 'You won $5000!'
        });
    });

    it('validation fails without a rewardsMessage value', () => {
        return testInvalid({
            name: 'Go out for a fancy dinner',
            purchasePrice: 100,
            rewardOdds: 20,
            rewardAmount: 5000,
        });
    });

    it('validation passes with all property values', () => {
        return new Activity(testActivity)
            .validate();
    });
});