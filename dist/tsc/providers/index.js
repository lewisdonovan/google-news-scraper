import fetchSerpApi from "./serpapi";
import fetchSerpBase from "./serpbase";
const providers = {
    serpapi: fetchSerpApi,
    serpbase: fetchSerpBase,
};
export const supportedSources = Object.keys(providers);
export const isSupportedSource = (source) => (Object.prototype.hasOwnProperty.call(providers, source));
const fetchThirdParty = (config, logger) => (providers[config.third_party.source](config, logger));
export default fetchThirdParty;
