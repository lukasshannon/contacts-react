const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');

const User = require('../models/User');

// Returns currently logged in user after getting token from auth middleware
router.get('/', auth, async (req, res) => {
  try {
    // Returns user from database without password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Could not complete server request');
  }
});

// Logs in user and returns authorization token
router.post('/', [
  check('email', 'Please enter a valid email address').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      // Check if user exists
      if (!user) {
        return res.status(400).json({ msg: 'No account associated with this email. Please register.' });
      }

      // Check if password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Incorrect password. Please try again.' });
      }

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
  }
);

module.exports = router;
