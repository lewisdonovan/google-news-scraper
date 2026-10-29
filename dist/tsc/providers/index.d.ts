import winston from "winston";
import { GNSConfig, Articles, ThirdPartySource } from "../types";
export declare const isSupportedSource: (source: string) => source is ThirdPartySource;
declare const fetchThirdParty: (config: GNSConfig, logger: winston.Logger) => Promise<Articles>;
export default fetchThirdParty;
