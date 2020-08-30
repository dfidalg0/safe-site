const { Router } = require('express');

const routes = Router();

routes.get('/', (req, res) => {
    res.render('login.ejs');
});

module.exports = routes;
