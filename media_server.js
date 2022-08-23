require('dotenv').config();
const NodeMediaServer = require('node-media-server');

const User = require('./models/User');
const EncoderEngine = require('./engine/encoderEngine');
const thumbnailEngine = require('./engine/thumbnailEngine');
const { encoders, streams } = require('./context/ctx');

const config = {
  rtmp: {
    port: process.env.RTMP_PORT || 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
};

const nodeMediaServer = new NodeMediaServer(config);

nodeMediaServer.on('prePublish', async (id, streamPath, args) => {
  const streamKey = getStreamKeyFromStreamPath(streamPath);

  const user = await User.findOne({ stream_key: streamKey }).exec();
  const streamKeyExists = user?.stream_key;

  if (!streamKeyExists) {
    const session = nodeMediaServer.getSession(id);
    session.reject();
  } else {
    const encoder = new EncoderEngine({ id, streamPath, streamKey });
    encoders.set(id, encoder);

    streams.set(id, {
      username: user.username,
      session: nodeMediaServer.getSession(id),
    });

    data = { id, streamPath, streamKey };

    encoder.prepareForEncoding();
    thumbnailEngine.watchForIncomingStreams(data);

    encoder.on('done', () => encoders.delete(id));
  }
});

// nodeMediaServer.on('audio&videoHandled', height => {});

nodeMediaServer.on('donePublish', (id, streamPath, args) => {
  const encoder = encoders.get(id);
  if (encoder) encoder.kill();
});

const getStreamKeyFromStreamPath = path => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

module.exports = nodeMediaServer;
