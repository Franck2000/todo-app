const logger = require("./logger");

function requestLogger(req, res, next) {
  logger.info({
    event: "REQUEST",
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers["user-agent"],
    timestamp: new Date().toISOString()
  });

  next();
}

module.exports = requestLogger;
