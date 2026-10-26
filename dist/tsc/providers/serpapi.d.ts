import winston from "winston";
import { GNSConfig, Articles } from "../types";
type Result = Record<string, any>;
export declare const buildParams: (config: GNSConfig) => Record<string, string>;
export declare const toArticles: (json: Result, now?: Date) => Articles;
declare const fetchSerpApi: (config: GNSConfig, logger: winston.Logger) => Promise<Articles>;
export default fetchSerpApi;
