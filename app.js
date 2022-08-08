require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// const nodeMediaServer = require('./media_server');

// const { port } = require('./config/default').http_server;
// const Logs = require('./logs/logs');
const routes = require('./routes/index');

const mongooseOptions = {
  useNewUrlParser: true,
};

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, mongooseOptions)
  .catch(error => console.log(error));

mongoose.connection.on('error', err => console.log(err));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.all('*', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:9500');
//   next();
// });

routes(app);

app.use((req, res, next) => {
  res.status(404).json({ error: '404! Not Found.' });
});

app.listen(3000, () => {
  console.log('Listening on port: ' + 3000);
});

// nodeMediaServer.run();
