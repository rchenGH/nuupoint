// location, bio, experiences, social network links
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile Model
const Profile = require('../../models/Profile');

// Load User Model
const Users = require('../../models/User');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({msg: 'profile works'}));

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {}

    // will match with user model, which will include the object id
    // want to match it to req.user.id
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile){
                errors.noprofile = "There is no profile for this user"
                res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err));
})

module.exports = router;