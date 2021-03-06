const mongoose = require('mongoose');
const User = require('../models/user.model');

module.exports.signup = (req, res, next) => {
    res.render('auth/signup');
};

module.exports.doSignup = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        res.render('auth/signup', { 
            user: { username: username }, 
            error: {
                username: username ? '' : 'Username is required',
                password: password ? '' : 'Password is required'
            }
        });
    }else{   
        User.findOne({ username: req.body.username })
            .then(user => {
                errorData = {
                    error: { username: 'Username already exists' }
                };
                if (user != null) {
                    console.log("Username already exists");            
                    res.render('auth/signup', errorData);
                } else {
                    user = new User(req.body);
                    user.save()
                    .then(() => {
                        console.log("User created");                      
                        res.redirect('/signok');
                    }).catch(error => {
                        if (error instanceof mongoose.Error.ValidationError) {
                        res.render('auth/signup', { user: user, error: error.errors })                      } else {
                        next(error)
                        }
                    });
                }  
                })
            .catch(error => next(error));
    }
};

module.exports.signok = (req, res, next) => {
  res.render('auth/signok');
};

module.exports.login = (req, res, next) => {
  // console.log(req.session.currentUser);
  res.render('auth/login');
};

module.exports.doLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      res.render('auth/login', { 
          user: { username: username }, 
          error: {
              username: username ? '' : 'Username is required',
              password: password ? '' : 'Password is required'
          }
      });
  } else {
      User.findOne({ username: username})
          .then(user => {          
              errorData = {
                  user: { username: username },
                  error: { username: 'Invalid username or password',
                           password: 'Invalid username or password' }
              };
              if (user) {
                  user.checkPassword(password)
                      .then(match => {
                          if (!match) {
                            // console.log(errorData);                            
                            res.render('auth/login', errorData);
                          } else {
                            req.session.currentUser = user;
                            res.redirect('/user/main');
                          }
                      })
                      .catch(error => next(error));
              } else {
                  res.render('auth/login', errorData);
              }
          })
          .catch(error => next(error));
  }
};

module.exports.logout = (req, res, next) => {
  req.session.destroy(error => {
      if (error) {
          next(error);
      } else {
          res.redirect("/login");
      }
  });
};