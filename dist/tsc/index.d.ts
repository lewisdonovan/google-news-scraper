import { GNSUserConfig, Articles } from "./types";
declare const googleNewsScraper: (userConfig: GNSUserConfig) => Promise<Articles>;
export * from "./types";
export default googleNewsScraper;
