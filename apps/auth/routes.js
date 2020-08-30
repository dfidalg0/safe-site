const { Router } = require('express');
const hasher = require('./utils/hashing').argon2;
const userController = require('../controllers/users');
const signer = require('./utils/jwt-signer');

const routes = Router();

routes.get('/', (req, res) => {
    res.send('Authentication server is OK');
});

routes.post('/login', async (req, res, next) => {
    let { username, password } = req.body;

    try {
        let user = await userController.findUser(username);

        if (!user || !await hasher.verify(user.password, password)) {
            res.status(403).send('Forbidden');
        }
        else {
            let token = await signer.sign(user);

            res.cookie('token', token, {
                httpOnly: true,
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
            });

            res.send('Authorized');
        }
    }
    catch (err){
        console.error(err);
        res.status(500);
        next();
    }
});

routes.post('/register', async (req, res, next) => {
    let { username, password } = req.body;

    try {
        if (typeof password !== 'string'){
            throw TypeError();
        }
        password = await hasher.hash(password);
        let user = await userController.addUser(username, password);

        if (!user){
            return res.status(403).send('User already exists');
        }

        return res.send('Authorized');
    }
    catch (err){
        if (err.constructor === TypeError){
            return res.status(403).send('Forbidden');
        }
        console.log(err);

        res.status(500);
        next();
    }
});

module.exports = routes;
