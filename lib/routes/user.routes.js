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
        let data = req.body;
        User.find({ username: data.username }).count()
            .then(count => {
                if(count > 0) throw {
                    code: 400,
                    error: `username ${data.username} already exists`
                };
                else {
                    data.retired = false; 
                    data.age = 18;
                    data.bank_account = Math.floor(Math.random()*200000) + 1;
                    data.networth = data.bank_account;
                    data.assets = [];
                    data.original_signup = new Date();
                    data.last_sign_in = data.original_signup;
                }
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
                } else { data.last_sign_in = new Date();}
                console.log(user);
                return user;
            })
            .then(user => token.sign(user))
            .then(token => res.send({token}))
            .catch(next);
    })

    .get('/:username', (req, res, next) => {
        const username = req.params.username;
        User.findOne({ username: username })
            .then(user => {
                if(!user){
                    res.status(404).send({error: 'Cannot Find User'});
                } else {
                    res.send(user);
                }
            });
    });

    // .get('/:username', (req, res, next) =>{
    //     const query = {};
    //     if(req.query.type) {
    //         query.type = req.query.type;
    //     }
    //     User.findOne(query)
    //         .then(user => res.send(user))
    //         .catch(next);
    // });

module.exports = userRouter;