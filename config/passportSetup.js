const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const User = require('../models/user')

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
    .then((user) => {
        done(null, user)
    }).catch((err) => {
        console.err('Error occurred during deserializing:', err)
        done(null, err);
    })
});

passport.use(new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: '/auth/google/redirect'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const currentUser = await User.findOne({googleId: profile.id})

        if (currentUser) {
            console.log('user is:', currentUser);
            done(null, currentUser)
        } else {
            newUser = await new User({
                username: profile.displayName,
                googleId: profile.id,
                thumbnail: profile._json.picture
            }).save();
            console.log('new user created:', newUser)
            done(null, newUser)
        }
    } catch (err) {
        console.error('Error during authentication:', err);
        done(null, err);
    }
    
}));

passport.use(new FacebookStrategy({
    clientID: keys.facebook.clientID,
    clientSecret: keys.facebook.clientSecret,
    callbackURL: 'http://localhost:2000/auth/facebook/redirect',
    profileFields: ['id', 'displayName', 'photos', 'email'] 
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const currentUser = await User.findOne({facebookId: profile.id})

        if (currentUser) {
            console.log('user is:', currentUser)
            done(null, currentUser)
        } else {
            const newUser = await new User({
                username: profile.displayName,
                facebookId: profile.id,
                thumbnail: profile.photos[0].value
            }).save();
            console.log('new user created:', newUser);
            done(null, newUser);
        }
    } catch (error) {
        console.error('Error during authentication:', err);
        done(null, err);
    }
}));


passport.use(new LocalStrategy({ 
    usernameField: 'email',
    passwordField: 'password' 
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return done(null, false, { message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials.' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));