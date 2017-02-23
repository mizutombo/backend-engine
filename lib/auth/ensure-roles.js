module.exports = function getEnsureRole(role) {
    return function ensureRole(req, res, next) {
            const roles = req.user.roles;
            if(roles === 'admin') next();
            else next({
                code: 403,
                error: 'Unauthorized'
            });
    };
};