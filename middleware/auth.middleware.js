function authMiddleware(req, res, next) {
    console.log(req.session);
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/auth/login');
    }
  }
  module.exports = authMiddleware;