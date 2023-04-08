const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

router.get('/', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'Home Page' });
});

router.get("/register", (req, res) => {
  res.render("form", { title: "Registration Form" });
});

router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', { title: 'Listing registrations', registrations });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));

router.post('/', 
    [
        check('name')
        .isLength({ min: 1 })
        .withMessage('Please enter a name'),
        check('email')
        .isLength({ min: 1 })
        .withMessage('Please enter an email'),
    ],
    async (req, res) => {
        //console.log(req.body);
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          const registration = new Registration(req.body);
          //generate salt to hash password
          const salt = await bcrypt.genSalt(10);
          //set user passwrod to hashed password
          registration.password = await bcrypt.hash(registration.password, salt);
          registration.save()
            .then(() => {res.render('thankyou', { title: 'Thank you'});
            })
            .catch((err) => {
              console.log(err);
              res.send('Sorry! Something went wrong.');
            });
        } else {
          res.render('form', { 
              title: 'Registration Form',
              errors: errors.array(),
              data: req.body,
             });
        }
    });

module.exports = router;