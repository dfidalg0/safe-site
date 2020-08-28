const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 3000;

const routes = {
    auth : require('./apps/auth/routes'),
    pages: require('./apps/pages/routes'),
}

const app = express();

app.use(helmet());
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(async (req, res, next) => {
    if (req.cookies.token){
        let id = jwt.decode(req.cookies.token);
        res.locals.id = id;
    }
    next();
});

app.use('/auth', routes.auth);
app.use('/', routes.pages);

app.listen(port, () => {
    console.log('Server started');
});
