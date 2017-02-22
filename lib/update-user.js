const User = require('./models/user.model');



// User.find.forEach(x => update(x));


module.exports = function update(date, user) {
    var elapsedGameYears;
    // var currentDate = new Date();

    // convert ms to days
    // 1 real day = 1 game month
    // ms * (1 calendar day/86400000 ms) * (1 game month/1 calendar day) * (1 game year/12 game months)
    elapsedGameYears = (date - user.original_signup) * (1 / 86400000) * (1 / 1) * (1 / 12);

    // update the user's age
    user.age = 18 + Math.floor(elapsedGameYears);
    console.log('elapsed game years is: ', elapsedGameYears);

    /* TODO: continue updating user stats: retired, bank acct, networth, house value? below */

    return user;
};
