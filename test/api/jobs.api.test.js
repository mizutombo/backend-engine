const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const assert = chai.assert;

const app = require('../../lib/app');

chai.use(chaiHttp);

process.env.DB_URI = 'mongodb://localhost:27017/jobs-REST';
require('../../lib/connection');

describe('job API', () => {

    before(() => mongoose.connection.dropDatabase());

    const request = chai.request(app);

    let testJob1 = {
        jobType: 'Unskilled',
        jobLevel: 'Mid-level',
        monthlySalary: 1500,
        promotionInterval: 24
    };

    let testJob2 = {
        jobType: 'Blue Collar',
        jobLevel: 'Senior',
        monthlySalary: 4000,
        promotionInterval: 0
    };

    function saveJob(job) {
        return request.post('/jobs')
            .send(job)
            .then(res => res.body);
    }

    it('gets all jobs', () => {
        return Promise.all([
            saveJob(testJob1),
            saveJob(testJob2)
        ])
        .then(savedJobs => {
            testJob1 = savedJobs[0];
            testJob2 = savedJobs[1];
        })
        .then(() => request.get('/jobs'))
        .then(res => {
            const jobs = res.body;
            assert.deepEqual(jobs, [testJob1, testJob2]);
        });
    });

});
