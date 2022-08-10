require('dotenv').config();
const cron = require('node-cron');
const { deleteThumbnailsOnSchedule } = require('../engine/thumbnailEngine');

const scheduleThumbnailsDeletion = () => {
  cron.schedule(process.env.DELETE_THUMBNAILS_AT, () => {
    deleteThumbnailsOnSchedule();
  });
};

scheduleThumbnailsDeletion();
