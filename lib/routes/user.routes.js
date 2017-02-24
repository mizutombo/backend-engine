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

//////////////////////////ADMIN////////////////////////////////

    .post('/signup/admin', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        let data = req.body;
        console.log(req.body);
        User.find({ username: data.username }).count()
            .then(count => {
                if(count > 0) throw {
                    code: 400,
                    error: `username ${data.username} already exists`
                };
                else if(data.password !== 'supersekritadminpassword') throw {
                    code: 401,
                    error: 'Unauthorized to Create Admin Account'
                };
                else {
                    data.original_signup = new Date();
                    data.last_sign_in = data.original_signup;
                    data.roles = 'admin';
                    return new User(data).save();
                }
            })
            .then(user => token.sign(user))
            .then(token => res.send({ token }))
            .catch(next);
    })
   /////////////Admin Assets CRUD - GET assets in assets.routes///////////// 
    .post('/admin/assets', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Asset(data).save()
            .then(asset => res.send(asset))
            .catch(next);
    })

    .patch('/admin/assets', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let assetId = req.body._id;

        return Asset.findById(assetId)
            .then(asset => {
               asset.purchase_price = req.body.purchase_price || asset.purchase_price;
               asset.asset_type = req.body.asset_type || asset.asset_type;
               asset.model = req.body.model || asset.model;
               asset.current_value = req.body.current_value || asset.current_value;
               asset.monthly_appreciation_percentage = req.body.monthly_appreciation_percentage || asset.monthly_appreciation_percentage;
               return asset.save();
            })
            .then(asset => res.send(asset))
            .catch(next);
    })

    .delete('/admin/assets', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let assetId = req.body;

        Asset.findByIdAndRemove(assetId)
            .then(assetId => {
                if(!assetId) {
                    res.status(404).send({error: 'Cannot Find Asset'});
                } else {
                    res.send({message: `Asset ${assetId} has been deleted`});
                }
            })
            .catch(next);
    })
/////////////////////Admin Jobs CRUD - GET is in jobs routes////////////////////////////
    .post('/admin/jobs', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Job(data).save()
            .then(job => res.send(job))
            .catch(next);
    })

    .patch('/admin/jobs', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let jobId = req.body;

        return Job.findById(jobId)
            .then(job => {
                job.jobType = req.body.jobType || job.jobType;
                job.jobLevel = req.body.jobLevel || job.jobLevel;
                job.monthlySalary = req.body.monthlySalary || job.monthlySalary;
                job.promotionInterval = req.body.promotionInterval || job.promotionInterval;
                return job.save();
            })
            .then(job => res.send(job))
            .catch(next);
    })

    .delete('/admin/jobs', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let jobId = req.body;

        Job.findByIdAndRemove(jobId)
            .then(jobId => {
                if(!jobId) {
                    res.status(404).send({error: 'Cannot Find Job'});
                } else {
                    res.send({message: `Job ${jobId} has been deleted`});
                }
            })
            .catch(next);
    })
///////////////Admin Education CRUD -GET in Ed. Routes/////////////
    .post('/admin/education', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Education(data).save()
            .then(education => res.send(education))
            .catch(next);
    })

    .patch('/admin/education', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let edId = req.body._id;

        return Education.findById(edId)
            .then(education => {
                education.educationLevel = req.body.educationLevel || education.educationLevel;
                education.educationCost = req.body.educationCost || education.educationCost;
                return education.save();
            })
            .then(education => res.send(education))
            .catch(next);
    })

    .delete('/admin/education', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let edId = req.body;

        Education.findByIdAndRemove(edId)
            .then(edId => {
                if(!edId) {
                    res.status(404).send({error: 'Cannot Find Education'});
                } else {
                    res.send({message: `Education ${edId} has been deleted`});
                }
            })
            .catch(next);
    })
/////////////Admin Activities CRUD - GET is in Activities Route/////
    .post('/admin/activities', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Activity(data).save()
            .then(activity => res.send(activity))
            .catch(next);
    })

    .patch('/admin/activities', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let actId = req.body._id;

        return Activity.findById(actId)
            .then(activity => {
                activity.name = req.body.name || activity.name;
                activity.purchasePrice = req.body.purchasePrice || activity.purchasePrice;
                activity.rewardOdds = req.body.rewardOdds || activity.rewardOdds;
                activity.rewardAmount = req.body.rewardAmount || activity.rewardAmount;
                activity.rewardMessage = req.body.rewardMessage || activity.rewardMessage;
                return activity.save();
            })
            .then(activity => res.send(activity))
            .catch(next);
    })
//////////////////////////////USER/////////////////////////////////

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
                    data.roles = 'user';
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
                    res.status(400).send({error: 'You do not have funds for this purchase'});
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
                if(user.networth > 1000000) {
                    activity.rewardMessage = 'YOU WON THE LOTTERY!!!! Congratulations!!!  You have achieved or surpassed a total networth of $1M dollars.  You have won the dbSimsPDX game and are able to retire at the young age of ' + `${user.age}` + ' years old ... well done!!!  ' + 'Your total networth at retirement is $' + `${user.networth}` + '.';
                }
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
                if(!desiredEd) return;
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