import fetchSerpApi from "./serpapi";
const providers = {
    serpapi: fetchSerpApi,
};
export const isSupportedSource = (source) => (Object.prototype.hasOwnProperty.call(providers, source));
const fetchThirdParty = (config, logger) => (providers[config.third_party.source](config, logger));
export default fetchThirdParty;
