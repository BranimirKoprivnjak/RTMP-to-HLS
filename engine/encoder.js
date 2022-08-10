require('dotenv').config();
const { workerData, parentPort } = require('worker_threads');
const { spawn } = require('child_process');

const { transmuxHlsArgs, screenshotArgs } = require('./ffmpeg');
const Logs = require('../logs/logs');

const ffmpeg = process.env.FFMPEG;
const port = process.env.RTMP_PORT || 1935;

function encode() {
  const { streamPath, streamKey } = workerData;

  const inputPath = `rtmp://127.0.0.1:${port}${streamPath}`;
  const streamOutputPath = `./media${streamPath}/master-%v.m3u8`;
  const thumbnailsOutputPath = `./media/thumbnails/${streamKey}/thumbnail_%03d.png`;

  const startTime = Date.now();

  Logs.log(
    '[Encoding HLS] ' +
      streamPath +
      ' to ' +
      `./media${streamPath}/playlist.m3u8`
  );

  args = [
    '-y',
    '-i',
    inputPath,
    ...transmuxHlsArgs,
    streamOutputPath,
    ...screenshotArgs,
    thumbnailsOutputPath,
  ];

  const process = spawn(ffmpeg, args);

  if (false) {
    process.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });
  }

  process.on('close', code => {
    const message = {};
    message.type = 'done';
    const endTime = Date.now();
    message.message = `Encoding finished after ${
      (endTime - startTime) / 1000
    } seconds!`;
    if (code !== 0) {
      message.exitCode = code;
    }
    parentPort.postMessage(message);
  });

  parentPort.on('message', message => {
    if (message !== null && typeof message === 'object') {
      if (message.type === 'kill') process.kill();
    }
  });
}

encode();
