# About

A Node.js server that transcodes video and audio coming from RTMP to HLS.<br>
Supports adaptive streaming (1080p, 720p, 480p, 360p).<br>
Generates stream thumbnails.<br>
Issues stream keys to publishers.<br>
Requires FFMPEG installed on local machine.<br>

## Publishing live streams

From OBS<br>
Settings -> Stream<br>
Service: Custom...<br>
Server: rtmp://localhost:1935/live/STREAM_KEY<br>
Stream key: Your stream key, generated by server<br>

## API

### Access currently live streams.

```
http://localhost:8080/live/streams
```

### Access the live stream.

```
http://localhost:8080/live/stream/STREAM_KEY
```

You can pass this to your videoplayer. It will serve .m3u8 and .ts chunks as requested from the videoplayer.<br>
Testing done using hls.js https://github.com/video-dev/hls.js/

### Get stream thumbnail.

```
http://localhost:8080/live/thumb/STREAM_KEY
```

### Get stream key.

In order to get stream key, you have to create user, you can do so by sending POST request to:

```
http://localhost:8080/auth/register
```

Body should consist of username, password and email fields. It adds user
to Mongo and creates unique stream key. However, if you don't care about
key validation, you can disable it in media_server.js

## To do

- delay vod deletion on stream end so clients have time to fetch latest chunks?
- cap frames to 30 on 360p & 480p resolution
- swap fs.watch with chokidar
- upgrade to fluent-ffmpeg?
- add Bilinear Image Scaling
- support input vid resolution detection so transcoder knows how to scale<br>
  (you could emit event once RTMP session handles audio&video, then move transcoder logic to event listener)
- add fallbacks for thumbs creation if source lower then 480p
- fine tune video bitrates
- rework /streams api

## Issues

Transcoding is very cpu expensive and is handled by FFMPEG. Ideally, you want to transmux the source and transcode
rest of the variants. However, we don't have control over the IDR intervals in the source RTMP stream, which is determined
by the broadcast software's configuration. If we transmux the source, the segments of the transmuxed and transcoded variants
are not guaranteed to align. This can cause major playback issues.
