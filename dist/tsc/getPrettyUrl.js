// const getPrettyUrl = (uglyUrl: string, logger: winston.Logger): string | null => {
//   const base64Match = uglyUrl.match(/\/read\/([A-Za-z0-9-_]+)/);
//   if (!base64Match) {
//     return null;
//   }
//   const base64String = base64Match[1];
//   try {
//     const decodedString = Buffer.from(base64String, "base64").toString("ascii");
//     const urlPattern = /https?:\/\/[^\s"']+/g;
//     const matches = decodedString.match(urlPattern) || [];
//     const urls = matches.flatMap(match => {
//       const splitUrls = match.split(/(?<!http:|https:)R(?![a-zA-Z0-9-_])|(?<!http:|https:)y(?![a-zA-Z0-9-_])/);
//       return splitUrls.filter(url => {
//         const cleanUrl = url.trim().replace(/[^\w\-\/:.]+$/, '').replace(/\\x[0-9A-Fa-f]{2}/g, '');
//         return cleanUrl;
//       });
//     });
//     const uniqueUrls = [...new Set(urls)];
//     const finalUrl = uniqueUrls.length ? uniqueUrls[0] : uglyUrl;
//     logger.info(finalUrl);
//     return finalUrl;
//   } catch (error) {
//     logger.error(error);
//     return null;
//   }
// }
const getPrettyUrl = (uglyUrl, logger) => {
    var _a, _b;
    try {
        // Step 1: Extract the encoded portion between 'read/' and '?'
        let encodedPart = uglyUrl.split('read/')[1].split('?')[0];
        // Step 2: Remove 'CB' prefix if present
        if (encodedPart.startsWith('CB')) {
            encodedPart = encodedPart.substring(2);
        }
        // Step 3: Replace URL-safe Base64 characters
        encodedPart = encodedPart.replace(/-/g, '+').replace(/_/g, '/');
        // Step 4: Add padding if necessary
        const padding = '='.repeat((4 - (encodedPart.length % 4)) % 4);
        encodedPart += padding;
        // Step 5: First Base64 decode
        const firstDecodedBytes = atob(encodedPart);
        // Step 6: Extract the second encoded string (Base64 URL-safe characters)
        const secondEncodedPart = (_b = (_a = firstDecodedBytes === null || firstDecodedBytes === void 0 ? void 0 : firstDecodedBytes.match(/[A-Za-z0-9\-_]+/g)) === null || _a === void 0 ? void 0 : _a.join('')) !== null && _b !== void 0 ? _b : '';
        // Step 7: Replace URL-safe characters in the second string
        let secondEncoded = secondEncodedPart.replace(/-/g, '+').replace(/_/g, '/');
        const secondPadding = '='.repeat((4 - (secondEncoded.length % 4)) % 4);
        secondEncoded += secondPadding;
        // Step 8: Second Base64 decode to get the final URL
        const finalURL = atob(secondEncoded);
        console.log('Final URL:', finalURL);
        return finalURL;
    }
    catch (error) {
        console.error('Error decoding URL:', error);
        return null;
    }
};
export default getPrettyUrl;
