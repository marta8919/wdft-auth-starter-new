//create your routes here
const router = require("express").Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')

// 1. Add a GET route for /signup . 
// Show the signup.hbs file when the user visits that route
router.get('/signup', (req, res, next)=>{
  res.render('./auth/signup')
})

// 2. Add a GET route for /signin . 
// Show the signin.hbs file when the user visits that route
router.get('/signin', (req, res, next)=>{
  res.render('./auth/signin')
})

router.post("/signup", (req, res, next)=>{
  const {name, email, password} = req.body
    // creating a salt 
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
      UserModel.create({name, email, password: hash})
      .then(() => {
        res.redirect('/')
      })
      .catch((err) => {
          next(err)
      })
  
})

// 3. don't forget to export your router with 'modeul.exports'

module.exports = router

// And finally don't forget to link this router in your middleware at the bottom of app.js where the other routes are defined

