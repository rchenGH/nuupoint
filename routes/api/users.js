const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport')

// load input validation
const validateRegisterInput = require('../../validation/register');

// load user model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: 'users works'}));

// @route   POST api/register
// @desc    Register User
// @access  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    User.findOne({email: req.body.email})
    .then(user => {
        if(user){
            return res.status(400).json({email: 'Email already exists'})
        } else {
            const avatar = gravatar.url(req.body.email, {
                s:'200',    // size
                r: 'pg',    // rating
                d: 'mm'     // default
            })
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user)
                        .catch(err => console.log(err)))
                })
            })
        }
    });
});

// @route   POST api/users/login
// @desc    Login / Returning JWT 
// @access  Public

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find email
    User.findOne({email: email})
        .then(user => {
            if(!user){
                return res.status(404).json({email: 'Email not found'})
            }

        // Check password
        bcrypt.compare(password, user.password)
            .then(isMatch => {
                if(isMatch){
                    const payload = { id: user.id, name: user.name, avatar: user.avatar};
                    jwt.sign(
                        payload, 
                        keys.secretOrKey, 
                        {expiresIn: 7200},
                        (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            })
                        }
                    );
                } else {
                    res.status(400).json({password: 'Password does not match'})
                }
            })
        });
})

// @route   GET api/users/current
// @desc    Return Current User
// @access  Private


router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    // under api/current, set the authorization under header with bearer token
    // this should return the payload given in user routes
    // user now in req
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});


module.exports = router;