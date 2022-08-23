const workerThreads = require('worker_threads');
const path = require('path');
const fs = require('fs/promises');
const EventEmitter = require('events');

const Logs = require('../logs/logs');

class EncoderEngine extends EventEmitter {
  constructor(data) {
    super();
    this.data = data;
    this.worker = null;
    this.path = path.join(__dirname, `../media/${this.data.streamPath}`);
  }

  async prepareForEncoding() {
    try {
      await fs.mkdir(this.path, { recursive: true });
      this.startEncoding();
    } catch (error) {
      Logs.error(error);
    }
  }

  startEncoding() {
    const { streamPath, streamKey } = this.data;

    Logs.log(
      `[Encoding HLS] ${streamPath} to ./media${streamPath}/playlist.m3u8`
    );

    this.worker = new workerThreads.Worker('./engine/encoder.js', {
      workerData: {
        streamPath,
        streamKey,
      },
    });

    this.worker.on('message', message => {
      if (message !== null && typeof message === 'object') {
        if (message.type === 'done') {
          Logs.log(message.message);
          this.emit('done');
          this.afterEncoding();
        }
      }
    });
  }

  // *IDEA* instead of deleting vods immediately, have global timer that will delete all vods every X mins
  // if dir in ./live exists but its not in encoderSessions map, delete content of dir
  async afterEncoding() {
    // timeout because resource could be busy [error: EBUSY]
    setTimeout(async () => {
      try {
        const files = await fs.readdir(this.path);
        for (const file of files) {
          fs.unlink(path.join(this.path, file));
        }
      } catch (error) {
        // if resource is busy, try again
        Logs.error(error);
      }
    }, 1000);
  }

  kill() {
    this.worker.postMessage('kill');
  }
}

module.exports = EncoderEngine;
