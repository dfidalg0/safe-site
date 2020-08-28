const { Router } = require('express');

const routes = Router();

routes.get('/', (req, res) => {
    res.send('<h1> Homepage </h1>');
});

module.exports = routes;
