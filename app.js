const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const passportSetup = require('./config/passportSetup');
const profileRoutes = require('./routes/profileRoutes');
const authRoutes = require('./routes/authRoutes');
const keys = require('./config/keys');
const User = require('./models/user');
const blogRoutes = require('./routes/blogRoutes')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(session({
    secret: keys.session.cookieKey,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));

app.use(passport.initialize());
app.use(passport.session());

const connection = mongoose.connection

mongoose.connect(keys.mongodb.URL);

connection.on('connected', () => {
    console.log('mongodb connection successfull');
});

connection.on('error', (error) => {
    console.log('mongodb connection failed');
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/blog', blogRoutes);

const authCheck = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.redirect('/auth/login') ;
    }
    next();
};

app.get('/', authCheck, (req, res) => {
    res.render('home', {user: req.user});
})


const port = process.env.PORT || 2000
app.listen(port, () => {
    console.log('node started using nodemon');
});