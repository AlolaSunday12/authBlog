const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const profileRoutes = require('../routes/profileRoutes');

// google authentication
router.get('/google/', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/profile');
});

// facebook authentication
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
}));

router.get('/facebook/redirect', passport.authenticate('facebook', {
    failureRedirect: '/auth/login'
}), (req, res) => {
    try {
        res.redirect('/profile')
    } catch (error) {
        console.error('Error occurred during redirect:', err)
        res.status(500).send('error occur')
    }
});

// logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return err(next)
        }
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }

            // Clear the cookie
            res.clearCookie('connect.sid'); // Adjust 'connect.sid' if you have a custom session cookie name
            res.redirect('/');
        });
    });
});

// Register Page Route
router.get('/register', (req, res) => {
    res.render('register', {user: req.user});
});

// Register POST Handler 
router.post('/register', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return res.status(400).render('register', { user: req.user, error: "Password fields cannot be empty" });
    }

    if (password !== confirmPassword) {
        return res.status(400).render('register', { user: req.user, error: "Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) { 
            return res.status(400).render('register', { user: req.user, error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
             email,
             username, 
             password: hashedPassword 
            });
        res.redirect('/auth/login')
    } catch (err) {
        console.error(err);
        return res.status(500).render('register', { user: req.user, error: 'Internal server error' });
    }
});

// login
router.get('/login', (req, res) => {
    res.render('login', {user: req.user})
});

// Login POST Handler
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email);

    if (!email || !password) { 
        return res.status(400).render('login', { user: req.user, error: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {   
            return res.status(404).render('login', { user: req.user, error: 'invalid user' });
        }

        if (!user.password) {
            return res.status(500).render('login', { user: req.user, error: 'Internal server error' });
        }

        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            return res.status(400).render('login', { user: req.user, error: 'Password does not matched' });
        }

        req.login(user, function(err) {
            if (err) { 
                console.log("Login failed:", err); 
                return next(err); 
            }
            console.log("Login successful: User", user.email, "has logged in.");
            return res.redirect('/profile');
        });
    } catch (err) {
        console.error(err);
        return res.status(500).render('login', { user: req.user, error: 'Internal server error' });
    }
});

module.exports = router;