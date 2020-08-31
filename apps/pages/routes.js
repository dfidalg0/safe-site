const { Router } = require('express');

const routes = Router();

routes.get('/', (req, res) => {
    return res.render('home.ejs');
});

routes.get('/login', (req, res) => {
    res.render('login.ejs');
});

routes.get('/register', (req, res) => {
    res.render('register.ejs');
});

module.exports = routes;
