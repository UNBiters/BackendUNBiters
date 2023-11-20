const express = require('express');
const router = express.Router();
const passport = require('passport');


router.get('/google', 
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3001/unbiters/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('http://localhost:3001');  // Redirect to a home page or profile page
  });

router.get('/authenticate', (req, res, next) => {
    return res.status(200).json({
        isAuthenticated: req.isAuthenticated()
    })
});

module.exports = router;