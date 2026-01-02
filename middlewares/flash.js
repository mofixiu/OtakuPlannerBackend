const flash = (req, res, next) => {
    req.flash = (message, type = 'success') => {
        req.session.message = {
            text: message,
            type: type
        };
    }
    res.back = () => {
        res.redirect(req.headers.referer || "/")
    }
    res.locals.flash = req.session.message || {};
    res.locals.errors = req.session.errors;
    res.locals.admin = req?.session.admin || null;
    // Clear the errors after displaying them
    req.session.errors = null;
    // Store the old input values
    res.locals.old = req.session.old;
    req.session.old = null;
    // Clear the message after displaying it
    req.session.message = null;


    next();
}

module.exports = flash;