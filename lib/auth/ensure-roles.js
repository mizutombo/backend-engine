module.exports = function getEnsureRole() {
    return function ensureRole(req, res, next) {
            const roles = req.user.roles;
            console.log(req);
            if(roles === 'admin') next();
            else next({
                code: 403,
                error: 'Unauthorized Action'
            });
    };
};