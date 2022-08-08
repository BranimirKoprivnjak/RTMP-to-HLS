const NodeMediaServer = require('node-media-server');
const cron = require('node-cron');

const { thumbnails, rtmp_server } = require('./config/default');
const User = require('./models/User');
const EncoderEngine = require('./engine/encoderEngine');
const thumbnailEngine = require('./engine/thumbnailEngine');

cron.schedule(thumbnails.crontab, () => {
  deleteThumbnailsOnSchedule();
});

const nodeMediaServer = new NodeMediaServer(rtmp_server);
// cosider using session management lib
const encoderSession = new Map();

nodeMediaServer.on('postPublish', async (id, streamPath, args) => {
  const streamKey = getStreamKeyFromStreamPath(streamPath);

  const keyExists = await User.streamKeyExists(streamKey);

  if (!keyExists) {
    const session = nodeMediaServer.getSession(id);
    session.reject();
  } else {
    const session = new EncoderEngine({ id, streamPath, streamKey });
    encoderSession.set(id, session);

    data = { id, streamPath, streamKey };

    session.prepareForEncoding();
    thumbnailEngine.watchForIncomingStreams(data);

    session.on('done', () => encoderSession.delete(id));
  }
});

nodeMediaServer.on('donePublish', (id, streamPath, args) => {
  const session = encoderSession.get(id);
  if (session) session.kill();
});

const getStreamKeyFromStreamPath = path => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

module.exports = nodeMediaServer;
