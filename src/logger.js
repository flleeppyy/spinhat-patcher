const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  // Call console.log
  logger.add(
    new winston.transports.Console({
      stderrLevels: ["error"], // for console.error() in the DevTools
      consoleWarnLevels: ["warn"], // for console.warn() in the DevTools
      level: "debug",
      format: winston.format.simple(),
    }),
  );
}

module.exports.logger = logger;
