const unwantedKeywords = [
  "subscribe now",
  "sign up",
  "newsletter",
  "sign up for our newsletter",
  "exclusive offer",
  "limited time offer",
  "free trial",
  "download now",
  "join now",
  "register today",
  "special promotion",
  "promotional offer",
  "discount code",
  "early access",
  "sneak peek",
  "save now",
  "don't miss out",
  "act now",
  "last chance",
  "expires soon",
  "giveaway",
  "free access",
  "premium access",
  "unlock full access",
  "buy now",
  "learn more",
  "click here",
  "follow us on",
  "share this article",
  "connect with us",
  "advertisement",
  "sponsored content",
  "partner content",
  "affiliate links",
  "for more information",
  "you may also like",
  "we think you'll like",
  "from our network",
];

export const cleanText = (text: string, filterWords: string[]): string =>
  text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.split(' ').length > 4)
    .filter(line => !unwantedKeywords.some(keyword => line.toLowerCase().includes(keyword)))
    .filter(line => !filterWords.some(word => line.toLowerCase().includes(word)))
    .join('\n');
