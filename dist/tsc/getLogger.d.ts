import { LogLevel } from "./types";
import winston from 'winston';
declare const getLogger: (level: LogLevel) => winston.Logger;
export default getLogger;
