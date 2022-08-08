const express = require('express');
const router = express.Router();

const { getMostRecentThumbnail } = require('../../engine/thumbnailEngine');

router.get('/:streamKey', async (req, res) => {
  const streamKey = req.params.streamKey;

  const thumb = await getMostRecentThumbnail(streamKey);
  // const filePath = path.join(
  //   __dirname,
  //   '/media/thumbnails/' + streamKey + '/' + thumb.file
  // );
  // const promise = await fs.readFile(filePath);
  res.send(thumb);
});

module.exports = router;
