const http_server = {
  port: 8080,
};

const rtmp_server = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
};

const encoding = {
  allowStdout: false,
  ffmpeg: 'C:\\ffmpeg\\bin\\ffmpeg.exe',
};

const thumbnails = {
  crontab: '0 0 */1 * * *', // on every full hour
  newThumbnailAfter: 60, // s
};

module.exports = {
  http_server,
  rtmp_server,
  encoding,
  thumbnails,
};
