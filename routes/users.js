const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); // Data validation
const bcrypt = require('bcryptjs'); // Hash
const jwt = require('jsonwebtoken'); // JWT
const config = require('config');

const User = require('../models/User');

// Register and create a new user
router.post('/', [
  check('name', 'Name is a required field').not().isEmpty(),
  check('email', 'Please enter a valid email address').isEmail(),
  check('password', 'Password must contain at least 6 characters').isLength({min: 6})
], async (req, res) => {
  const validationErrors = validationResult(req);
  if(!validationErrors.isEmpty()){
    return res.status(400).json({errors: validationErrors.array()});
  }
  
  const {name, email, password} = req.body;

  try {
    let user = await User.findOne({ email });

    // Check duplicates
    if (user) {
      return res.status(400).json({ msg: 'A user with this email already exists. Please sign in.' });
    }

    // Create user
    user = new User({
      name,
      email,
      password
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(15);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Return user-specific authentication token
    const payload = {
      user: {
        id: user.id // JWT encodes user's ID
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {
        expiresIn: 3600 // Expires in 1 hour
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // If no errors, return token
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Could not complete server request');
  }
});

module.exports = router;
