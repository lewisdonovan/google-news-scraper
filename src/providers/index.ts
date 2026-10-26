import winston from "winston";
import fetchSerpApi from "./serpapi";
import { GNSConfig, Articles, ThirdPartySource } from "../types";

const providers: Record<ThirdPartySource, (config: GNSConfig, logger: winston.Logger) => Promise<Articles>> = {
  serpapi: fetchSerpApi,
};

export const isSupportedSource = (source: string): source is ThirdPartySource => (
  Object.prototype.hasOwnProperty.call(providers, source)
)

const fetchThirdParty = (config: GNSConfig, logger: winston.Logger): Promise<Articles> => (
  providers[config.third_party!.source](config, logger)
)

export default fetchThirdParty;
