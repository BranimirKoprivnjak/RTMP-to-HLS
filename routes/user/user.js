const express = require('express');
const router = express.Router();

const User = require('../../models/User');

router.get('/stream_key', async (req, res) => {
  const streamKey = Date.now().toString();
  User.addStreamKey(streamKey);
  res.json({ stream_key: streamKey });
});

module.exports = router;
