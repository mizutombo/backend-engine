const Job = require('../lib/models/job.model');
const assert = require('chai').assert;
const testInvalid = require('./test-invalid')(Job);

let testJob = {
    job_type: 'Unskilled',
    job_level: 'Mid-level',
    monthly_salary: 1500,
    promotion_interval: 24
};

describe('tests Job Model', () => {
    it('validation fails without job_type value', () => {
        return testInvalid({
            job_level: 'Mid-level',
            monthly_salary: 1500,
            promotion_interval: 24
        });
    });
    it('validation fails without job_level value', () => {
        return testInvalid({
            job_type: 'Unskilled',
            monthly_salary: 1500,
            promotion_interval: 24
        });
    });
    it('validation fails without monthly_salary value', () => {
        return testInvalid({
            job_type: 'Unskilled',
            job_level: 'Mid-level',
            promotion_interval: 24
        });
    });
    it('validation fails without promotion_interval value', () => {
        return testInvalid({
            job_type: 'Unskilled',
            job_level: 'Mid-level',
            monthly_salary: 1500
        });
    });
    it('validation passes with all values', () => {
        return new Job(testJob)
            .validate();
    });
});

