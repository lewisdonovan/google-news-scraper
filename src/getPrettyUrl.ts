import winston from "winston";

const getPrettyUrl = (uglyUrl: string, logger: winston.Logger): string => {
  // Return original URL if no input provided
  if (!uglyUrl) {
    return "";
  }

  const base64Match = uglyUrl.match(/\/read\/([A-Za-z0-9-_]+)/);
  if (!base64Match) {
    return uglyUrl; // Return original URL if no base64 found
  }
  
  const base64String = base64Match[1];
  try {
    const decodedString = Buffer.from(base64String, "base64").toString("ascii");
    const urlPattern = /https?:\/\/[^\s"']+/g;
    const matches = decodedString.match(urlPattern) || [];
    const urls = matches.flatMap(match => {
      const splitUrls = match.split(/(?<!http:|https:)R(?![a-zA-Z0-9-_])|(?<!http:|https:)y(?![a-zA-Z0-9-_])/);
      return splitUrls.filter(url => {
        const cleanUrl = url.trim().replace(/[^\w\-\/:.]+$/, '').replace(/\\x[0-9A-Fa-f]{2}/g, '');
        return cleanUrl;
      });
    });
    const uniqueUrls = [...new Set(urls)];
    const finalUrl = uniqueUrls.length ? uniqueUrls[0] : uglyUrl;
    logger.info(`Pretty URL: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    logger.error(`Error decoding URL: ${error}`);
    return uglyUrl; // Return original URL if decoding fails
  }
}

export default getPrettyUrl;