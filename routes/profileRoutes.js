const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

const authCheck = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.redirect('/auth/login') ;
    }
    next();
};

router.get('/', authCheck, (req, res) => {
    res.render('profile', {user: req.user})
});

module.exports = router;