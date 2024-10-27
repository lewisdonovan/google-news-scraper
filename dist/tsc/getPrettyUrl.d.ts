import winston from "winston";
declare const getPrettyUrl: (uglyUrl: string, logger: winston.Logger) => string | null;
export default getPrettyUrl;
