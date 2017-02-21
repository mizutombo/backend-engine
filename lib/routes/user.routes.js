const express = require('express');
const Router = express.Router;
const userRouter = Router();
const User = require('../models/user.model.js');
const token = require('../auth/token.js');
const bodyParser = require('body-parser').json();
const ensureAuth = require('../auth/ensure-auth')();

function hasUserNameAndPassword(req, res, next) {
    const user = req.body;
    if(!user.username || !user.password) {
        return next({
            code: 400,
            error: 'username and password must be provided'
        });
    }
    next();
}

userRouter
    .post('/signup', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        const data = req.body;
        
        User.find({ username: data.username }).count()
            .then(count => {
                if(count > 0) throw {
                    code: 400,
                    error: `username ${data.username} already exists`
                };
                return new User(data).save();
            })
            .then(user => token.sign(user))
            .then(token => res.send({ token }))
            .catch(next);
    })

    .post('/signin', bodyParser, hasUserNameAndPassword, ensureAuth, (req, res, next) => {
        const data = req.body;

        User.findOne({ username: data.username })
            .then(user => {
                if(!user || !user.comparePassword(data.password)) {
                    throw {
                        code: 400,
                        error: 'invalid username or password'
                    };
                }
                return user;
            })
            .then(user => token.sign(user))
            .then(token => res.send({token}))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const query = {};
        if(req.query.type) {
            query.type = req.query.type;
        }
        User.find(query)
            //.populate may need to go here
            .then(user => res.send(user))
            .catch(next);
    });

module.exports = userRouter;