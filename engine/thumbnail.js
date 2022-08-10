require('dotenv').config();
const { spawn } = require('child_process');

const { initialScreenshotArgs } = require('./ffmpeg');
const Logs = require('../logs/logs');

const ffmpeg = process.env.FFMPEG;

const createInitialThumbnail = streamKey => {
  const inputPath = `./media/live/${streamKey}/master-480p.m3u8`;
  const outputPath = `./media/thumbnails/${streamKey}/thumbnail_000.png`;

  const args = ['-y', '-i', inputPath, ...initialScreenshotArgs, outputPath];

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
    if (code !== 0) {
      Logs.warning('Process exited with code: ' + code);
    }
  });
};

module.exports = createInitialThumbnail;
