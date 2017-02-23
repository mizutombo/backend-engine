const express = require('express');
const Router = express.Router;
const userRouter = Router();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Asset = require('../models/asset.model');
const Job = require('../models/job.model');
const Activity = require('../models/activity.model');
const Education = require('../models/education.model');
const token = require('../auth/token.js');
const bodyParser = require('body-parser').json();
const ensureAuth = require('../auth/ensure-auth')();
const ensureRole = require('../auth/ensure-roles')();

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

function getJob(query) {
    let entryJob = {};
    return Job.find( { jobLevel: 'Entry' } )
        .then(jobs => {
            //TODO: investigate using aggregate $sample
            if(!jobs.length) return;
            let job = jobs.filter(j => {
                return j.jobType === query;
            });
            entryJob.start_date = new Date();
            entryJob.job_name = job[0]._id;
            return entryJob;
        });
}

function getFirstEducation() {
    let firstEd = {};
    return Education.findOne( { educationLevel: 'High School' } )
        .then(school => {
            if(!school) return;
            firstEd = school._id;
            return firstEd;
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
                    data.activities = [];
                    data.original_signup = new Date();
                    data.last_sign_in = data.original_signup;
                    return getJob('Unskilled');
                }
            })
            .then(job => {
                data.job = job;
                return getFirstEducation();
            })
            .then(education => {
                data.education = education;
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

    .post('/:username/activities', bodyParser, (req, res, next) => {
        
        function getActivityOutcome(user, activity) {
            let randomNum = Math.floor(Math.random()*100 + 1);
            if (randomNum <= activity.rewardOdds) {
                user.activities.wonReward = true;
                user.bank_account = user.bank_account + activity.rewardAmount;
                user.networth = user.networth + activity.rewardAmount;
                user.activities.push(savedActivity);
                user.save();
                return activity.rewardMessage;
            } else {
                user.activities.wonReward = false;
                user.activities.push(savedActivity);
                user.save();
                return 'You got what you paid for! No reward today. Womp.';
            }
        }

        let reqActivityId = req.body;
        let desiredActivity = {};
        let savedActivity = {};
        const username = req.params.username;
        
        //TODO: investigate using aggregate $sample
        Activity.findById(reqActivityId)
            .then(activity => {
                if(!activity) return;
                else {desiredActivity = activity;}
            });
        return User.findOne( { username: username } )
            .then(user => {
                const cash = user.bank_account;

                if(desiredActivity.purchasePrice > cash) {
                    res.status(400).send({error: 'You do have funds for this purchase'});
                } else {
                    user.bank_account = user.bank_account - desiredActivity.purchasePrice;
                    user.networth = user.networth - desiredActivity.purchasePrice;
                    savedActivity.activity_name = desiredActivity._id;
                    
                    return getActivityOutcome(user, desiredActivity);
                }
            })
            .then(message => {
                res.send(message);
            })
            .catch(next);
    })

    .post('/:username/education', bodyParser, (req, res, next) => {
        let reqEdId = req.body;
       

        const username = req.params.username;

        Education.findById(reqEdId)
            .then(desiredEd => {
                return User.findOne({ username: username })
                    .then(user => {
                        const cash = user.bank_account;

                        if (desiredEd.educationCost > cash) {
                            res.status(400).send({ error: 'You do have funds for this purchase' });
                        } else {
                            user.bank_account = user.bank_account - desiredEd.educationCost;
                            user.networth = user.networth - desiredEd.educationCost;
                            user.education = desiredEd._id;
                            if (desiredEd.educationLevel === 'Vocational') {
                               return getJob('Blue Collar')
                                    .then(job => {
                                        user.job = job;
                                        user.save();
                                        return user;
                                    });
                            } else if (desiredEd.educationLevel === 'College') {
                                return getJob('White Collar')
                                    .then(job => {
                                        user.job = job;
                                        user.save();
                                        return user;
                                    });
                            } else {
                                return user;
                            }
                        }
                    })
                    .then(user => res.send(user))
                    .catch(next);

            });


    })

    .get('/:username', ensureAuth, (req, res, next) => {
        const username = req.params.username;
        User.findOne({ username: username })
            .populate('job.job_name')
            .populate('assets.asset_name')
            .populate('activities.activity_name')
            .populate('education')
            .then(user => {
                if(!user){
                    res.status(404).send({error: 'Cannot Find User'});
                } else if (user.networth >= 1000000) {
                    // if user's networth is greater than or equal to $1M, then declare as winner ...
                    res.send('Congratulations!!!  You have achieved or surpassed a total networth of $1M dollars.  You have won the dbSimsPDX game and are able to retire at the young age of ' + `${user.age}` + ' years old ... well done!!!  ' + 'Your total networth at retirement is $' + `${user.networth}` + '.');
                    /* TODO: provide user with final update of their data ... */
                    res.send(user);
                }
                else { 
                    /* TODO: provide user with update of their current data ... */
                    res.send(user);
                }
            })
            .catch(next);
    })
    
    .patch('/me/changeAccountInfo', ensureAuth, bodyParser, (req, res, next) => {
        const userId = req.user.id;
        return User.findByIdAndUpdate(userId)
            .then(user => {
                user.username = req.body.username || user.username;
                if(req.body.password) user.password = req.body.password;
                user.save();
                return user;
            })
            .then(user => res.send(user))
            .catch(next);
    })

    .delete('/me', ensureAuth, bodyParser, (req, res, next) => {
        const userId = req.user.id;
        User.findByIdAndRemove(userId)
            .then( () => res.send({message: 'Your user account has been deleted!'}))
            .catch(next);
    });
        /* TODO: need to figure out a way to have the game check the user's total networth and then provide them with an updated summary of their age, networth, bank_account, assets, etc. WITHOUT having to go through the username path */


module.exports = userRouter;