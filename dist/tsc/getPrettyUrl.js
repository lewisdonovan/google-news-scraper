const getPrettyUrl = (uglyUrl, logger) => {
    const base64Match = uglyUrl.match(/\/read\/([A-Za-z0-9-_]+)/);
    if (!base64Match) {
        return null;
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
        logger.info(finalUrl);
        return finalUrl;
    }
    catch (error) {
        logger.error(error);
        return null;
    }
};
export default getPrettyUrl;
