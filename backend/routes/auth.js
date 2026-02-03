const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const admin = require('firebase-admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: 'dummy',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0\n-----END PRIVATE KEY-----\n',
  client_email: `firebase-adminsdk@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
  client_id: '1234567890',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.log('Firebase Admin SDK initialization skipped - will use client-side auth');
}

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid email or password format' });
      }

      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already registered. Please login.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        email,
        passwordHash,
        authProvider: 'email'
      });

      await user.save();

      res.status(201).json({ 
        message: 'Registration successful',
        success: true 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid email or password format' });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not registered. Please register first.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          authProvider: 'email'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        token,
        user: {
          id: user._id,
          email: user.email,
          authProvider: user.authProvider
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.post('/phone-login', async (req, res) => {
  try {
    const { idToken, phoneNumber } = req.body;

    if (!idToken || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = new User({
        phoneNumber,
        authProvider: 'phone'
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        phoneNumber: user.phoneNumber,
        authProvider: 'phone'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Phone login error:', error);
    res.status(500).json({ error: 'Phone authentication failed' });
  }
});

module.exports = router;
