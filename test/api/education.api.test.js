const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const assert = chai.assert;

const app = require('../../lib/app');

chai.use(chaiHttp);

process.env.DB_URI = 'mongodb://localhost:27017/education-REST';
require('../../lib/connection');

describe('education API : ', () => {

    before(() => 
    mongoose.connection.dropDatabase());

    const request = chai.request(app);

    let testEducation1 = {
        educationLevel: 'Vocational',
        educationCost: 20000
    };

    let testEducation2 = {
        educationLevel: 'College',
        educationCost: 120000
    };

    function saveEducation(education) {
        return request.post('/education')
            .send(education)
            .then(res => res.body);
    }

    it('gets all education', () => {
        return Promise.all([
            saveEducation(testEducation1),
            saveEducation(testEducation2)
        ])
        .then(savedEducation => {
            testEducation1 = savedEducation[0];
            testEducation2 = savedEducation[1];
        })
        .then(() => request.get('/education'))
        .then(res => {
            const education = res.body;
            assert.deepEqual(education, [testEducation1, testEducation2]);
        });
    });

});