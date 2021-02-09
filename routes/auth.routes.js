const router = require("express").Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')

/* GET signin page */
router.get("/signin", (req, res, next) => {
    // Shows the sign in form to the user
    res.render('auth/signin.hbs')
});

/* GET signup page */
router.get("/signup", (req, res, next) => {
    // Shows the sign up form to the user
    res.render('auth/signup.hbs')
});

// Handle POST requests to /signup
// when the user submits the data in the sign up form, it will come here
router.post("/signup", (req, res, next) => {
    // we use req.body to grab data from the input form
     const {name, email, password} = req.body
    //console.log(req.body) // check if this is an empty object
    // if not use the length 


    //validate first
    // checking if the user has entered all three fields
    // we're missing one important step here
    if (!name.length || !email.length || !password.length) {
        res.render('auth/signup', {msg: 'Please enter all fields'})
        return;
    }

    // validate if the user has entered email in the right format ( @ , .)
     // regex that validates an email in javascript
     let re = /\S+@\S+\.\S+/;
     if (!re.test(email)) {
        res.render('auth/signup', {msg: 'Email not in valid format'})
        return;
     }

     //validate password (special character, some numbers, min 6 length)
     /*
     let regexPass = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8,20}$/;
     if (!regexPass.test(password)) {
        res.render('auth/signup', {msg: 'Password needs to have special chanracters, some numbers and be 6 characters aatleast'})
        return;
     }

     */

     // NOTE: We have used the Sync methods here. 
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
});

// handle post requests when the user submits something in the sign in form
router.post("/signin", (req, res, next) => {
    const {email, password} = req.body

    // implement the same set of validations as you did in signup as well
    // NOTE: We have used the Async method here. Its just to show how it works
    UserModel.findOne({email: email})
        .then((result) => {
            // if user exists
            if (result) {
                //check if the entered password matches with that in the DB
                bcrypt.compare(password, result.password)
                    .then((isMatching) => {
                        if (isMatching) {
                            // when the user successfully signs up
                            req.session.loggedInUser = result
                            res.redirect('/profile')
                        }
                        else {
                            // when passwords don't match
                            res.render('auth/signin.hbs', {msg: 'Passwords dont match'})
                        }
                    })
            }
            else {
                // when the user signs in with an email that does not exits
                res.render('auth/signin.hbs', {msg: 'Email does not exist'})
            }
        })
        .catch((err) => {
            next(err)
        })
   
});


// GET request to handle /profile


const checkLoggedInUser = (req, res, next) => {
  if (req.session.loggedInUser) {
      next()
  }
  else {
      res.redirect('/signin')
  }
}


router.get('/profile',checkLoggedInUser, (req, res, next) => {
    let email = req.session.loggedInUser.email
    res.render('profile.hbs', {email})
})


router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})



module.exports = router;