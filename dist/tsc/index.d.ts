import { GNSUserConfig, Article } from "./types";
declare const googleNewsScraper: (userConfig: GNSUserConfig) => Promise<Article[]>;
export * from "./types";
export default googleNewsScraper;
