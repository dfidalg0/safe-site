const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');

const port = process.env.PORT || 3000;

const routes = {
    auth : require('./apps/auth/routes'),
    pages: require('./apps/pages/routes'),
};

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    name: 's_token',
    resave: false,
    saveUninitialized: false,
    cookie : {
        httpOnly: true
    }
}

const app = express();

if (app.get('env') === 'production'){
    sessionConfig.cookie.secure = true;
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates', 'views'));

app.use(helmet());
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session(sessionConfig));

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/auth', routes.auth);
app.use('/', routes.pages);

app.listen(port, () => {
    console.log('Server started');
});
