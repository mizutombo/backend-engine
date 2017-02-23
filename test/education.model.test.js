const Education = require('../lib/models/education.model');
const assert = require('chai').assert;
const testInvalid = require('./test-invalid')(Education);

let testEducation = {
    educationLevel: 'Vocational',
    educationCost: 20000
};

describe('tests Education Model', () => {
    it('validation fails without educationLevel value', () => {
        return testInvalid({
            educationCost: 20000
        });
    });
    it('validation fails without educationCost value', () => {
        return testInvalid({
            educationLevel: 'Vocational'
        });
    });
    it('validation passes with all education values', () => {
        return new Education(testEducation)
            .validate();
    });
});