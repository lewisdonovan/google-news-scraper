import fetchSerpApi from "./serpapi";
import fetchHasData from "./hasdata";
const providers = {
    serpapi: fetchSerpApi,
    hasdata: fetchHasData,
};
export const SUPPORTED_SOURCES = Object.keys(providers);
export const isSupportedSource = (source) => (Object.prototype.hasOwnProperty.call(providers, source));
const fetchThirdParty = (config, logger) => (providers[config.third_party.source](config, logger));
export default fetchThirdParty;
