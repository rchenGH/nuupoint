// location, bio, experiences, social network links
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const validateProfileInput = require('../../validation/profile');

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
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = "There is no profile for this user"
                res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err));
})

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if(!isValid){
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    // get or detect fields
    const profileFields = {}
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.skills) profileFields.skills = req.body.skills;
    // if(req.body.favouriteNewsOrgs) profileFields.favouriteNewsOrgs = req.body.favouriteNewsOrgs;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // split skills from CSV to array
    if(typeof req.body.skills !== undefined){
        profileFields.skills = req.body.skills.split(',');
    }
    
    // social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    // find the user id and set
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile){
                // if there is a profile, then update, not create a new one
                Profile.findOneAndUpdate(
                    {user: req.user.id}, 
                    {$set: profileFields}, 
                    {new: true}
                )
                .then(profile => res.json(profile));
            } else {
                // otherwise, create
                // check if handle exists, do not want multiple handles
                Profile.findOne({handle: profileFields.handle}).then(profile => {
                    if(profile){
                        errors.handle = 'That handle already exists';
                        res.status(400).json(errors)
                    }
                    // if no profile with that handle, we continue
                    // save profile
                    new Profile(profileFields).save()
                        .then(profile => {
                            res.json(profile)
                        })
                        .catch(err => res.status(400).json(err));
                })
            }
        })
})

module.exports = router;