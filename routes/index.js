const authRouter = require('./auth/auth');
const userRouter = require('./user/user');
const streamAuth = require('./stream/stream');

const routes = server => {
  server.use('/', authRouter);
  server.use('/', userRouter);
  server.use('/', streamAuth);
};

module.exports = routes;
