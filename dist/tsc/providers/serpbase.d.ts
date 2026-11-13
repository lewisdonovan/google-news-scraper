import winston from "winston";
import { GNSConfig, Articles } from "../types";
type Result = Record<string, any>;
export declare const buildRequest: (config: GNSConfig) => Result;
export declare const toArticles: (json: Result) => Articles;
declare const fetchSerpBase: (config: GNSConfig, logger: winston.Logger) => Promise<Articles>;
export default fetchSerpBase;
