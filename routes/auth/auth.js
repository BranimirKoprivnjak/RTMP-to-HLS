require('dotenv').config;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../middleware');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    const user = new User();
    const { hash, salt } = await user.generatePassword(password);
    user.email = email;
    user.password.hash = hash;
    user.password.salt = salt;
    user.stream_key = user.generateStreamKey();
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '7 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(400).json({ msg: 'Email or password incorrect' });
    }

    const { hash, salt } = user.password;
    const isMatch = await user.validatePassword(password, hash, salt);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email or password incorrect' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/protected', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
