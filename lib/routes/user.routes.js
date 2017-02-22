const express = require('express');
const Router = express.Router;
const userRouter = Router();
const User = require('../models/user.model.js');
const Asset = require('../models/asset.model.js');
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
                } 
                user.last_sign_in = new Date();
                user.save();
                return user;
            })
            .then(user => token.sign(user))
            .then(token => res.send({token}))
            .catch(next);      

    })

    .post('/:username/assets', bodyParser, (req, res, next) => {
        let data = req.body;
        let desiredAsset = {};
        let savedAsset = {};
        const username = req.params.username;
        console.log('DATA', data);
        Asset.findById(data._id)
            .then(asset => {
                desiredAsset = asset;
                console.log('DESIRED ASSET', asset);
            });
        return User.findOne({username: username})
            .then(user => {
                const cash = user.bank_account;
                if(desiredAsset.purchase_price > cash) { 
                    res.status(400).send({error: 'You do have funds for this purchase'});
                } else {

                    user.bank_account = user.bank_account - desiredAsset.purchase_price;
                    savedAsset.purchase_date = new Date();
                    savedAsset.asset_name = desiredAsset;
                    user.assets.push(savedAsset);
                }
                return user.save();
            })
            .then(user => res.send(user))
            .catch(next);
    })

    .get('/:username', (req, res, next) => {
        const username = req.params.username;
        User.findOne({ username: username })
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
    });
        /* TODO: need to figure out a way to have the game check the user's total networth and then provide them with an updated summary of their age, networth, bank_account, assets, etc. WITHOUT having to go through the username path */


module.exports = userRouter;