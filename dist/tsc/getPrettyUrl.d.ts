import winston from "winston";
export declare const getArticleId: (googleUrl: string) => string | null;
export declare const decodeLegacyId: (id: string) => string | null;
declare const getPrettyUrl: (googleUrl: string, logger: winston.Logger) => Promise<string | null>;
export default getPrettyUrl;
