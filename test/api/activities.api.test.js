const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../../lib/app');

const assert = chai.assert;

chai.use(chaiHttp);

process.env.DB_URI = 'mongodb://localhost:27017/activities-REST';
require('../../lib/connection');

describe('activities REST API', () => {

    before(() => mongoose.connection.dropDatabase());
    const request = chai.request(app);

    let janeDoe = {
        username: 'janeDoe',
        password: 'jfk'
    };
    
    let janeDoeToken = '';

    let testActivity1 = {
        name: 'Go out for a fancy dinner',
        purchasePrice: 100,
        rewardOdds: 20,
        rewardAmount: 5000,
        rewardMessage: 'You won $5000!'
    };

    let testActivity2 = {
        name: 'Play the lottery',
        purchasePrice: 1,
        rewardOdds: 2,
        rewardAmount: 600000,
        rewardMessage: 'You won $60,000!'
    };

    function saveActivity(token, activity) {
        return request.post('/activities')
            .send(activity)
            .set('Authorization', token)
            .then(res => res.body);
    }

    it('gets all activities', () => {
        return request
            .post('/user/signup')
            .send(janeDoe)
            .then((res) => {
                janeDoeToken = res.body.token;
                return Promise.all([
                    saveActivity(janeDoeToken, testActivity1),
                    saveActivity(janeDoeToken, testActivity2)
            ])
            .then(savedActivity => {
                testActivity1 = savedActivity[0];
                testActivity2 = savedActivity[1];
            });
        })
        .then(() => {
            return request
            .get('/activities')
            .set('Authorization', janeDoeToken);
        })
        .then(res => {
            const activities = res.body;
            assert.deepEqual(activities, [testActivity1, testActivity2]);
        });
    });


});