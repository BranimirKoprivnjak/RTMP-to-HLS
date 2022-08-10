require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs/promises');
const fs2 = require('fs');
const { streams } = require('../../context/ctx');
const { getMostRecentThumbnail } = require('../../engine/thumbnailEngine');

// gets latest stream thumbnail
router.get('/thumb/:streamKey', async (req, res) => {
  const streamKey = req.params.streamKey;

  try {
    const latestThumb = await getMostRecentThumbnail(streamKey);
    const filePath = path.join(
      __dirname,
      '../../media/thumbnails/' + streamKey + '/' + latestThumb
    );
    res.status(200).sendFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ msg: 'Thumbnail not found' });
    } else {
      res.status(500).json({ msg: 'Server error' });
    }
  }
});

// gets hls playlist file;
// TODO: gzip compression,
// double check everything with draft https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-08
// .ts response, what content type? octet-stream or video/MP2T
// .m3u8, what content type?
// implement some kind of timeout for request from same ip
router.get('/stream/:streamKey/:fileType', async (req, res) => {
  const filePath = path.join(
    __dirname,
    '../../media/live/' + req.params.streamKey + '/' + req.params.fileType
  );

  try {
    switch (path.extname(req.url)) {
      case '.m3u8':
        const playlist = await fs.readFile(filePath);
        res
          .set('Content-Type', 'application/vnd.apple.mpegurl')
          .status(200)
          .send(playlist);
        break;
      case '.ts':
        // const chunk = await fs.readFile(filePath);
        res.set('Content-Type', 'video/mp2t').status(206).send(chunk);
        const chunk = fs2.createReadStream(filePath, { bufferSize: 64 * 1024 });
        chunk.pipe(res);
        break;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ msg: 'Resource not found' });
    } else {
      res.status(500).json({ msg: 'Server error' });
    }
  }
});

// gets data about currently live streams
router.get('/streams', async (req, res) => {
  const stats = {};

  for await (const [_, stream] of streams) {
    const { username, session } = stream;
    if (session.isStarting) {
      let regRes = /\/(.*)\/(.*)/gi.exec(
        session.publishStreamPath || session.playStreamPath
      );

      if (regRes === null) return;

      const streamKey = regRes[2];

      if (session.isPublishing) {
        stats.id = session.id;
        stats.ip = session.socket.remoteAddress;
        stats.username = username;
        stats.thumbnail = `http://localhost:${process.env.HTTP_PORT}/live/thumb/${streamKey}`;
        stats.connectCreated = session.connectTime;
        stats.bytesRead = session.socket.bytesRead;
        // there won't be audio and video data until rtmp fires a/v handler events
        stats.audio =
          session.audioCodec > 0
            ? {
                codec: session.audioCodecName,
                profile: session.audioProfileName,
                samplerate: session.audioSamplerate,
                channels: session.audioChannels,
              }
            : null;
        stats.video =
          session.videoCodec > 0
            ? {
                codec: session.videoCodecName,
                width: session.videoWidth,
                height: session.videoHeight,
                profile: session.videoProfileName,
                level: session.videoLevel,
                fps: session.videoFps,
              }
            : null;
      }
    }
  }
  res.status(200).json(stats);
});

module.exports = router;
