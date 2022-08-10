require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodeMediaServer = require('./media_server');

const Logs = require('./logs/logs');
const routes = require('./routes/index');

const mongooseOptions = {
  useNewUrlParser: true,
};

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, mongooseOptions)
  .catch(error => console.log(error));

mongoose.connection.on('error', err => console.log(err));

const port = process.env.HTTP_PORT || 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// app.use(express.static('media')); could be used to serve .m3u8 & .ts

routes(app);

app.use((req, res) => {
  res.status(404).json({ error: '404! Not Found.' });
});

app.listen(port, () => {
  Logs.log('Listening on port: ' + port);
});

nodeMediaServer.run();
