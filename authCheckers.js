function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/user/login")
}
function checkUnAuthenticated(req, res, next) {
    if (! req.isAuthenticated()) {
        next()
    } else {
        res.redirect("/user/dashboard")
    }
}
module.exports = {checkAuthenticated : checkAuthenticated , checkUnAuthenticated : checkUnAuthenticated}