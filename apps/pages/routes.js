const { Router } = require('express');

const routes = Router();

routes.get('/', (req, res) => {
    let { userID } = req.session;

    if (userID){
        res.render('dashboard.ejs', { userID });
    }
    else res.render('home.ejs', { userID });
});

routes.get(['/login', '/register'], (req, res, next) => {
    if (req.session.userID){
        return res.redirect('/');
    }

    next();
});

routes.get('/login', (req, res) => {
    let errors = req.session.errors || {};

    req.session.destroy();
    res.render('login.ejs', { errors });
});

routes.get('/register', (req, res) => {
    let errors = req.session.errors || {};

    req.session.destroy();
    res.render('register.ejs', { errors });
});

routes.use((req, res) => {
    let { userID } = req.session;

    if (res.statusCode < 400){
        res.status(404);
    }

    let code = res.statusCode;

    let message;

    switch (code){
        case 403: message = 'Forbidden'; break;
        case 404: message = 'Page not found'; break;
        case 500: message = 'Internal server error'; break;
        default:  message = '';
    }

    res.render('error.ejs', { code, message, userID });
});

module.exports = routes;
