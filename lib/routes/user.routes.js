const express = require('express');
const Router = express.Router;
const userRouter = Router();
const User = require('../models/user.model.js');
const bodyParser = require('body-parser');

userRouter
    .get('/:id', (req, res, next) => {
        const query = {};
        if(req.query.type) {
            query.type = req.query.type;
        }
        User.find(query)
            //.populate may need to go here
            .then(user => res.send(user))
            .catch(next);
    })
    