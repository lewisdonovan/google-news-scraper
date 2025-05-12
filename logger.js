const winston = require('winston');

const getLogger = (level = 'error') => {
  return winston.createLogger({
    level: level,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
};

module.exports = getLogger;