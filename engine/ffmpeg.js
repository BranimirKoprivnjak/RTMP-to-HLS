require('dotenv').config();

// add FRAME-RATE attr
const transmuxHlsArgs = [
  '-map',
  '0:v:0',
  '-map',
  '0:a:0',
  '-map',
  '0:v:0',
  '-map',
  '0:a:0',
  '-map',
  '0:v:0',
  '-map',
  '0:a:0',
  '-map',
  '0:v:0',
  '-map',
  '0:a:0',
  '-c:v',
  'libx264',
  '-crf',
  '23',
  '-g',
  '120',
  '-keyint_min',
  '120',
  '-sc_threshold',
  '0',
  '-c:a',
  'aac',
  '-ar',
  '48000',
  '-filter:v:0',
  'scale=w=1920:h=1080',
  '-b:v:0',
  '7400k',
  '-b:a:0',
  '192k',
  '-filter:v:1',
  'scale=w=1280:h=720',
  '-b:v:1',
  '4400k',
  '-b:a:1',
  '128k',
  '-filter:v:2',
  'scale=w=852:h=480',
  '-b:v:2',
  '1600k',
  '-b:a:2',
  '128k',
  '-filter:v:3',
  'scale=w=640:h=360',
  '-b:v:3',
  '900k',
  '-b:a:3',
  '96k',
  '-var_stream_map',
  'v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p v:3,a:3,name:360p',
  '-preset',
  'veryfast',
  '-threads',
  '0',
  '-f',
  'hls',
  '-hls_list_size',
  '3',
  '-hls_time',
  '6',
  '-master_pl_publish_rate',
  '2',
  '-hls_flags',
  'delete_segments+independent_segments',
  '-master_pl_name',
  'playlist.m3u8',
];

const screenshotArgs = [
  '-y',
  '-vf',
  `fps=1/${process.env.NEW_THUMBNAIL_EVERY},scale=440:-1`,
];

const initialScreenshotArgs = ['-frames:v', '1', '-s', '440x248'];

module.exports = {
  transmuxHlsArgs,
  screenshotArgs,
  initialScreenshotArgs,
};

// https://www.martin-riedl.de/2020/04/17/using-ffmpeg-as-a-hls-streaming-server-overview/
// https://docs.peer5.com/guides/production-ready-hls-vod/#how-to-choose-the-right-bitrate
// http://ffmpeg.org/ffmpeg-formats.html#hls
// https://trac.ffmpeg.org/wiki/Encode/H.264
// https://gist.github.com/tayvano/6e2d456a9897f55025e25035478a3a50
