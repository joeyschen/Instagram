const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../keys');
const requireLogin = require('../middleware/requireLogin')


router.post('/signup', (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        res.status(422).json({error: "you are missing a field"});
    }

    User.findOne({email: email})
    .then((savedUser) => {
        if(savedUser){
            return res.status(422).json({error: "user already exists"})
        }

        bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email, 
                password: hashedPassword,
                name
            });
            
            console.log(user);
    
            user.save()
            .then(user => {
                res.json({message: "saved successfully"});
            })
            .catch(err => {
                console.log(err);
            })
        })
        
    })
    .catch(err => {
        console.log(err);
    }) 
})

router.post('/signin', (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        res.status(422).json({erro: "please add email or password"});
    }

    User.findOne({email: email})
    .then(savedUser => {
        if(!savedUser){
            return res.status(422).json({error: "Invalid Email or password"})
        }
        
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch){
                const token = jwt.sign({_id: savedUser._id}, JWT_SECRET);
                res.json({token})
            }
            else{
                return res.status(422).json({error: "Invalid Email or password"})
            }
        })
        .catch(err => {
            console.log(err)
        })
    })
})

module.exports = router