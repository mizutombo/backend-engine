const bodyParser = require('body-parser').json();
const express = require('express');
const Job = require('../models/job.model');
const Router = express.Router;

const jobRouter = Router();

jobRouter
    .get('/', (req, res, next) => {
        Job.find()
            .then(jobs => res.send(jobs))
            .catch(next);
    })
    .post('/', bodyParser, (req, res, next) => {
        return new Job(req.body).save()
            .then(job => {
                res.send(job);
            })
            .catch(next);
    });


module.exports = jobRouter;
