const authRouter = require('./auth/auth');
const userRouter = require('./user/user');
const streamRouter = require('./stream/stream');

const routes = server => {
  server.use('/auth', authRouter);
  server.use('/user', userRouter);
  server.use('/live', streamRouter);
};

module.exports = routes;
