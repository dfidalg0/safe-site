const { Router } = require('express');
const hasher = require('./utils/hashing').argon2;
const db = require('../database/manager');
const jwt = require('jsonwebtoken');

const routes = Router();

routes.get('/', (req, res) => {
    res.send('Authentication server is OK');
});

routes.post('/login', async (req,res) => {
    let { username, password } = req.body;

    let user = await db.findUser(username);

    if (!user){
        return res.send('Unauthorized');
    }

    if (await hasher.verify(user.password, password)){
        let token = jwt.sign(user.id, 'secret');

        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 2*60*60*1000)
        });

        return res.send('Authorized');
    }
    else {
        res.status(403).send('Unauthorized');
    }
});

routes.post('/register', async (req,res) => {
    let { username, password } = req.body;

    password = await hasher.hash(password);

    try {
        let user = await db.addUser(username, password);
        return res.send('Authorized');
    }
    catch (e){
        return res.status(403).send('User already exists');
    }
});

module.exports = routes;
