const getPrettyUrl = url => {
  const base64Pattern = /articles\/([A-Za-z0-9+_\-\/=]+)/;
  const match = url.match(base64Pattern);

  if (match && match[1]) {
    const base64EncodedUrl = match[1].replace(/-/g, "+").replace(/_/g, "/");
    try {
      let decodedUrl = Buffer.from(base64EncodedUrl, "base64").toString("ascii");

      // Remove any trailing "R" if it's the last character
      decodedUrl = decodedUrl.replace(/R/, "");

      // Remove non-ASCII characters and split by potential delimiters
      const parts = decodedUrl.split(/[^\x20-\x7E]+/).filter(Boolean);

      // Regular expression to validate and extract URLs
      const urlPattern = /(https?:\/\/[^\s]+)/;
      let cleanedUrl = "";

      // Iterate over parts to find the first valid URL
      for (let part of parts) {
        const urlMatch = part.match(urlPattern);
        if (urlMatch && urlMatch[1]) {
          cleanedUrl = urlMatch[1];
          break; // Stop at the first match
        }
      }

      if (cleanedUrl) {
        // Log the cleaned URL in a well-formatted JSON
        const output = {
          originalUrl: url,
          cleanedUrl: cleanedUrl
        };

        // console.log(JSON.stringify(output, null, 2));
        return cleanedUrl;
      } else {
        console.error("No valid URL found in the decoded string:", decodedUrl);
        return url;
      }
    } catch (error) {
      console.error(
        "Error decoding Base64 string:",
        base64EncodedUrl,
        "Original URL:",
        url,
        "Error:",
        error.message,
      );
      return url;
    }
  } else {
    console.error("No Base64 segment found in the URL. Original URL:", url);
    return url;
  }
}

module.exports = {
  default: getPrettyUrl
}