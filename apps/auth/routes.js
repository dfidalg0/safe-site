const { Router } = require('express');
const hasher = require('./utils/hashing').argon2;
const userController = require('../controllers/users');
const signer = require('./utils/jwt-signer');

const routes = Router();

routes.use((req, res, next) => {
    if (req.method !== 'POST'){
        res.status(403);
    }
    next();
});

routes.post('/login', async (req, res, next) => {
    let { username, password, remember } = req.body;

    try {
        let user = await userController.findUser(username);

        if (!user || !await hasher.verify(user.password, password)) {
            res.redirect('/login');
        }
        else {
            let token = await signer.sign(user);

            res.cookie('token', token, {
                httpOnly: true,
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
            });

            res.redirect('/');
        }
    }
    catch (err){
        console.error(err);
        res.status(500);
        next();
    }
});

routes.post('/register', async (req, res, next) => {
    let { username, email, password, passchecker, remember } = req.body;

    try {
        if (typeof password !== 'string'){
            throw TypeError();
        }
        password = await hasher.hash(password);
        let user = await userController.addUser(username, password, email);

        if (!user){
            return res.redirect('/register');
        }

        return res.redirect('/');
    }
    catch (err){
        console.log(err);

        res.status(500);
        next();
    }
});

module.exports = routes;
