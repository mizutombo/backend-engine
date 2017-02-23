const express = require('express');
const Router = express.Router;
const userRouter = Router();
const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const Asset = require('../models/asset.model.js');
const Job = require('../models/job.model');
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

function getRandomJob() {
    let entryJob = {};
    return Job.find( { jobLevel: 'Entry' } )
        .then(jobs => {
            //TODO: investigate using aggregate $sample
            if(!jobs.length) return;
            let maxJobs = jobs.length + 1;
            let randomNum = Math.floor(Math.random() * maxJobs);
            entryJob.start_date = new Date();
            entryJob.job_name = jobs[randomNum]._id;
            return entryJob;
        });
}

userRouter
    .get('/verify', ensureAuth, (req, res) => {
        res.send({ valid: true });
    })

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
                    return getRandomJob();
                }
            })
            .then(job => {
                data.job = job;
                return new User(data).save();
            })
            .then(user => token.sign(user))
            .then(token => res.send({ token }))
            .catch(next);
    })

    .post('/signin', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        const data = req.body;

        User.findOne({ username: data.username })
            .then(user => {
                if(!user || !user.comparePassword(data.password)) {
                    throw {
                        code: 400,
                        error: 'invalid username or password'
                    };
                } 
                user.last_sign_in = new Date();
                user.save();
                return user;
            })
            .then(user => token.sign(user))
            .then(token => res.send({token}))
            .catch(next);
    })

    .post('/:username/assets', bodyParser, ensureAuth, (req, res, next) => {
        let data = req.body;
        let desiredAsset = {};
        let savedAsset = {};
        const username = req.params.username;
        Asset.findById(data._id)
            .then(asset => {
                desiredAsset = asset;
            });
        return User.findOne({username: username})
            .then(user => {
                const cash = user.bank_account;
                if(desiredAsset.purchase_price > cash) { 
                    res.status(400).send({error: 'You do have funds for this purchase'});
                } else {

                    user.bank_account = user.bank_account - desiredAsset.purchase_price;
                    savedAsset.purchase_date = new Date();
                    savedAsset.asset_name = desiredAsset._id;
                    user.assets.push(savedAsset);
                }
                return user.save();
            })
            .then(user => res.send(user))
            .catch(next);
    })

    .get('/:username', ensureAuth, (req, res, next) => {
        const username = req.params.username;
        User.findOne({ username: username })
            .populate('job.job_name')
            .populate('assets.asset_name')
            .then(user => {
                console.log('user',user);
                if(!user){
                    res.status(404).send({error: 'Cannot Find User'});
                } else {
                    res.send(user);
                }
            });
    });


module.exports = userRouter;