
const express = require('express');
const Router = express.Router;
const activityRouter = Router();

const bodyParser = require('body-parser').json();

const Activity = require('../models/activity.model.js');

activityRouter
    .get('/', (req, res, next) => {
        Activity.find()
            .then(activities => {
                res.send(activities);
            })
            .catch(next);
    })
    .post('/', bodyParser, (req, res, next) => {
        return new Activity(req.body).save()
            .then(activity => res.send(activity))
            .catch(next);

    });

module.exports = activityRouter;