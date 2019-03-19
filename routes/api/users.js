const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')

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
                    res.json({msg: "Success"})
                } else {
                    res.status(400).json({password: 'Password does not match'})
                }
            })
        });
})

module.exports = router;