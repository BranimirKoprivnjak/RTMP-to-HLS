const chalk = require('chalk');

const logTime = () => {
  let nowDate = new Date();
  return (
    nowDate.toLocaleDateString() +
    ' ' +
    nowDate.toLocaleTimeString([], { hour12: false })
  );
};

const log = (...args) => {
  console.log(logTime(), process.pid, chalk.bold.green('[INFO]'), ...args);
};

const warning = (...args) => {
  console.log(logTime(), process.pid, chalk.bold.yellow('[WARNING]'), ...args);
};

const error = (...args) => {
  console.log(logTime(), process.pid, chalk.bold.red('[ERROR]'), ...args);
};

const debug = (...args) => {
  console.log(logTime(), process.pid, chalk.bold.blue('[DEBUG]'), ...args);
};

const ffdebug = (...args) => {
  console.log(logTime(), process.pid, chalk.bold.blue('[FFDEBUG]'), ...args);
};

module.exports = {
  log,
  warning,
  error,
  debug,
  ffdebug,
};
