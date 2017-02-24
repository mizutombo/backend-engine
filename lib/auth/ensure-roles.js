module.exports = function getEnsureRole() {
    return function ensureRole(req, res, next) {
            const roles = req.user.roles;
            if(roles === 'admin') next();
            else next({
                code: 403,
                error: 'Unauthorized Action'
            });
    };
};