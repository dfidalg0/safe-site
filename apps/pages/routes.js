const { Router } = require('express');

const routes = Router();

routes.get('/', (req, res) => {
    return res.render('home.ejs');
});

routes.get('/login', (req, res) => {
    let errors = req.session.errors || {};

    req.session.errors = null;
    res.render('login.ejs', { errors });
});

routes.get('/register', (req, res) => {
    let errors = req.session.errors || {};

    req.session.errors = null;
    res.render('register.ejs', { errors });
});

routes.use((_req, res) => {
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

    res.render('error.ejs', { code, message });
});

module.exports = routes;
