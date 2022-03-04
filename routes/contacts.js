const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, oneOf, validationResult } = require('express-validator');

const Contact = require('../models/Contact');

// GET ALL CONTACTS
router.get('/', auth, async (req, res) => {
  try {
    // Find contacts that belong to user returned by auth middleware
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Could not complete server request');
  }
});

// ADD CONTACT
router.post(
  '/',
  auth, [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Must be a valid email address').isEmail(),
  check('phone', 'Must be a valid phone number').isMobilePhone()
  ], async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      let newContact = await Contact.findOne({ name, user: req.user.id });

      // Check duplicates
      if (newContact) {
        return res.status(400).json({ msg: 'A contact with this name is already in your list.' });
      }

      // Create new contact
      newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id
      });
      // Save contact to database
      const contact = await newContact.save();

      // Return new contact
      res.json(contact);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Could not complete server request');
    }
  }
);

// UPDATE CONTACT BY ID PARAMETER
router.put('/:id', auth, oneOf([
  check('name', 'Name cannot be empty').not().isEmpty(),
  check('email', 'Must be a valid email address').isEmail(),
  check('phone', 'Must be a valid phone number').isMobilePhone()
  ], "Please ensure name, email and phone are valid."), async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { name, email, phone, type } = req.body;

    // Build contact object
    const contactFields = {};
    if (name) contactFields.name = name;
    if (email) contactFields.email = email;
    if (phone) contactFields.phone = phone;
    if (type) contactFields.type = type;

    try {
      // Search for contact in database by ID
      let contact = await Contact.findById(req.params.id);
      if (!contact) return res.status(404).json({ msg: 'Contact does not exist' });

      // Check that user from auth middleware is the owner of the contact
      if (contact.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Access denied. You are not the owner of this contact.' });
      }

      // Update contact information in database
      contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { $set: contactFields }, // update all from set
        { new: true } // if contact does not exist, create it
      );

      res.json(contact);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Could not complete server request');
    }
});

// DELETE CONTACT BY ID PARAMETER
router.delete('/:id', auth, async (req, res) => {
  try {
    // Search database for contact
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: 'Contact does not exist' });

    // Check that user from auth middleware is the owner of the contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Access denied. You are not the owner of this contact.' });
    }

    // Delete contact
    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Contact deleted' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Could not complete server request');
  }
});

module.exports = router;
