import winston from "winston";

const log_level = process.env.NODE_ENV !== "production" ? "debug" : "info";

const logger = winston.createLogger({
    level: log_level,
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()]
});

export default logger;
