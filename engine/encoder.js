require('dotenv').config();
const { workerData, parentPort } = require('worker_threads');
const { spawn } = require('child_process');

const variants = require('./config');

const { FFMPEG, RTMP_PORT, NEW_THUMB_EVERY } = process.env;

const encode = () => {
  const { streamPath, streamKey } = workerData;

  const inputPath = `rtmp://127.0.0.1:${RTMP_PORT}${streamPath}`;
  const streamOutputPath = `./media${streamPath}/master-%v.m3u8`;
  const thumbnailsOutputPath = `./media/thumbnails/${streamKey}/thumbnail_%03d.png`;

  const startTime = Date.now();

  // should come from mediaHandled event listener
  const sourceRes = { width: 1920, height: 1080 };

  const outputVariants = variants.filter(
    format =>
      format.resolution.height <= sourceRes.height &&
      format.resolution.width <= sourceRes.width
  );

  const args = ['-y', '-i', inputPath];
  const maps = [];
  const filters = [];
  const streamMap = ['-var_stream_map', ''];
  const x264 = [
    '-c:v',
    'libx264',
    '-g',
    '120',
    '-keyint_min',
    '120',
    '-sc_threshold',
    '0',
    '-preset',
    'veryfast',
  ];
  const aac = ['-c:a', 'aac', '-ar', '48000'];
  const hls = [
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
  ];
  const masterPlaylist = ['-master_pl_name', 'playlist.m3u8'];
  const screenshot = ['-y', '-vf', `fps=1/${NEW_THUMB_EVERY},scale=440:-1`];

  for (let i = 0; i < outputVariants.length; i++) {
    const { resolution, videoBitrate, audioBitrate } = outputVariants[i];
    const { width, height } = resolution;
    maps.push('-map', '0:v:0', '-map', '0:a:0');
    filters.push(
      `-filter:v:${i}`,
      `scale=w=${width}:h=${height}`,
      `-b:v:${i}`,
      `${videoBitrate}`,
      `-b:a:${i}`,
      `${audioBitrate}`
    );
    streamMap[1] += `v:${i},a:${i},name:${height}p `;
  }

  args.push(...maps);
  args.push(...x264);
  args.push(...aac);
  args.push(...filters);
  args.push(...streamMap);
  args.push(...hls);
  args.push(...masterPlaylist);
  args.push(streamOutputPath);
  args.push(...screenshot);
  args.push(thumbnailsOutputPath);

  // console.dir(args, { maxArrayLength: null });

  const process = spawn(FFMPEG, args);

  // process.stdout.on('data', data => {
  //   Logs.ffdebug(`${data}`);
  // });

  // process.stderr.on('data', data => {
  //   Logs.ffdebug(`${data}`);
  // });

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
};

encode();
