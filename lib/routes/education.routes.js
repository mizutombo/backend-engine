const bodyParser = require('body-parser').json();
const express = require('express');
const Education = require('../models/education.model');
const Router = express.Router;

const educationRouter = Router();

educationRouter
    .get('/', (req, res, next) => {
        Education.find()
            .then(education => res.send(education))
            .catch(next);
    })
    .post('/', bodyParser, (req, res, next) => {
        new Education(req.body).save()
            .then(education => {
                res.send(education);
            })
            .catch(next);
    });

    module.exports = educationRouter;