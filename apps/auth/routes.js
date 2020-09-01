const { Router } = require('express');
const hasher = require('./utils/hashing').argon2;
const userController = require('../controllers/users');
const signer = require('./utils/jwt-signer');
const validator = require('./utils/request-validator');

const routes = Router();

routes.use((req, res, next) => {
    if (req.method !== 'POST'){
        res.status(403);
    }
    next();
});

routes.use(validator);

function checkUser (req) {
    req.check('username')
        .isByteLength('username must have from 5 to 32 characters', {
            min: 5, max: 32
        })
        .matches('Invalid characters on username', /^[\w\_\.\-]+$/);
}

function checkPass (req){
    req.check('password')
        .isAscii('Invalid password')
        .isByteLength('password must have at least 10 characters', {
            min: 10, max: 400
        });
}

routes.post('/login', async (req, res, next) => {
    let { username, password, remember } = req.body;

    try {
        checkUser(req);

        checkPass(req);

        let user = await userController.findUser(username);

        if (!user || !await hasher.verify(user.password, password)) {
            req.addError('login', 'Wrong username or password');
        }

        if (req.errors) {
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
        console.error(err.stack);
        res.status(500);
        next();
    }
});

routes.post('/register', async (req, res, next) => {
    let { username, email, password, passchecker, remember } = req.body;

    try {
        checkUser(req);

        checkPass(req);

        req.check('email').isEmail('Insert a valid email');

        req.check('password')
            .equals('Password doesn\'t match confirmation', passchecker);

        if (req.errors){
            return res.redirect('/register');
        }

        password = await hasher.hash(password);
        let user = await userController.addUser(username, password, email);

        if (!user){
            req.addError('isAllowed', 'User already exists', 'username');
            console.log(req.errors);
            return res.redirect('/register');
        }

        return res.redirect('/');
    }
    catch (err){
        console.error(err.stack);

        res.status(500);
        next();
    }
});

module.exports = routes;
