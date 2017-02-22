const Job = require('../lib/models/job.model');
const assert = require('chai').assert;
const testInvalid = require('./test-invalid')(Job);

let testJob = {
    jobType: 'Unskilled',
    jobLevel: 'Mid-level',
    monthlySalary: 1500,
    promotionInterval: 24
};

describe('tests Job Model', () => {
    it('validation fails without jobType value', () => {
        return testInvalid({
            jobLevel: 'Mid-level',
            monthlySalary: 1500,
            promotionInterval: 24
        });
    });
    it('validation fails without jobLevel value', () => {
        return testInvalid({
            jobType: 'Unskilled',
            monthlySalary: 1500,
            promotionInterval: 24
        });
    });
    it('validation fails without monthlySalary value', () => {
        return testInvalid({
            jobType: 'Unskilled',
            jobLevel: 'Mid-level',
            promotionInterval: 24
        });
    });
    it('validation fails without promotionInterval value', () => {
        return testInvalid({
            jobType: 'Unskilled',
            jobLevel: 'Mid-level',
            monthlySalary: 1500
        });
    });
    it('validation passes with all values', () => {
        return new Job(testJob)
            .validate();
    });
});

