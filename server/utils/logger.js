import winston from "winston";

const { combine, timestamp, printf, json, colorize } = winston.format;

const isProduction = process.env.NODE_ENV === "production";

const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const base = `[${timestamp}] ${level}: ${message}`;
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return base + metaStr;
});

const transports = [
  new winston.transports.Console({
    level: isProduction ? "info" : "debug",
    format: combine(timestamp(), colorize(), consoleFormat),
  }),
];

// Optional file transport in production
if (isProduction) {
  transports.push(
    new winston.transports.File({ filename: "logs/app.log", level: "info", format: combine(timestamp(), json()) })
  );
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error", format: combine(timestamp(), json()) })
  );
}

const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: combine(timestamp(), json()),
  transports,
});

export default logger;
