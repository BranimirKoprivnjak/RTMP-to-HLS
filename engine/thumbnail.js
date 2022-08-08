const { spawn } = require('child_process');

const { encoding } = require('../config/default');
const { initialScreenshotArgs } = require('./ffmpeg');
const Logs = require('../logs/logs');

const createInitialThumbnail = streamKey => {
  const inputPath = `./media/live/${streamKey}/master-480p.m3u8`;
  const outputPath = `./media/thumbnails/${streamKey}/thumbnail_000.png`;

  const args = ['-y', '-i', inputPath, ...initialScreenshotArgs, outputPath];

  const process = spawn(encoding.ffmpeg, args);

  if (encoding.allowStdout) {
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
