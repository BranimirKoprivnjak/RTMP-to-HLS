const fs = require('fs/promises');
const path = require('path');

const createInitialThumbnail = require('./thumbnail');
const Logs = require('../logs/logs');

const watchForIncomingStreams = async data => {
  const thumbPath = path.join(
    __dirname,
    `../media/thumbnails/${data.streamKey}`
  );
  const streamPath = path.join(__dirname, `../media/live/${data.streamKey}`);

  const ac = new AbortController();
  const { signal } = ac;

  const timeout = setTimeout(() => {
    ac.abort();
  }, 10000);

  try {
    await fs.mkdir(thumbPath, { recursive: true });

    // not consistent across platforms, use chokidar
    const watcher = fs.watch(streamPath, { signal });
    for await (const event of watcher) {
      if (event.filename === 'master-480p0.ts') {
        clearTimeout(timeout);
        throw new Error('CustomAbortError');
      }
    }
  } catch (error) {
    if (error.message === 'CustomAbortError') {
      ac.abort();
      Logs.log('Processing thumbnails...');
      createInitialThumbnail(data.streamKey);
    } else if (error.name === 'AbortError') {
      Logs.error('Cannot start generating thumbnails!');
    } else {
      Logs.error(error);
    }
  }
};

const getMostRecentThumbnail = async streamKey => {
  const thumbPath = path.join(__dirname, `../media/thumbnails/${streamKey}`);
  const files = await fs.readdir(thumbPath);
  return files[files.length - 1];
};

const deleteThumbnailsOnSchedule = async () => {
  const rootDir = path.join(__dirname, `../media/thumbnails`);
  try {
    const allThumbnails = await fs.readdir(rootDir);
    for (const thumbnailsPerStream of allThumbnails) {
      const thumbnailsPerStreamDir = await fs.readdir(
        `${rootDir}/${thumbnailsPerStream}`
      );
      for (const thumbnail of thumbnailsPerStreamDir) {
        fs.unlink(`${rootDir}/${thumbnailsPerStreamDir}/${thumbnail}`);
      }
    }
  } catch (error) {
    Logs.error(error);
  }
};

module.exports = {
  watchForIncomingStreams,
  getMostRecentThumbnail,
  deleteThumbnailsOnSchedule,
};
