import * as cheerio from 'cheerio';
const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
];
export const timeAgo = (date, now = new Date()) => {
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size)
            return rtf.format(-Math.floor(seconds / size), unit);
    }
    return rtf.format(-seconds, 'second');
};
const parseFeed = (xml, now = new Date()) => {
    const $ = cheerio.load(xml, { xml: true });
    return $('item').map((_, item) => {
        var _a;
        const $item = $(item);
        const source = $item.find('source').text().trim();
        const rawTitle = $item.find('title').text().trim();
        // Feed titles end with " - Source"; the source has its own field
        const title = source && rawTitle.endsWith(` - ${source}`)
            ? rawTitle.slice(0, -(source.length + 3))
            : rawTitle;
        const published = new Date($item.find('pubDate').text());
        const valid = !isNaN(published.getTime());
        return {
            title,
            link: $item.find('link').text().trim(),
            image: '',
            source,
            sourceUrl: (_a = $item.find('source').attr('url')) !== null && _a !== void 0 ? _a : '',
            datetime: valid ? published.toISOString() : '',
            time: valid ? timeAgo(published, now) : '',
            articleType: 'regular',
        };
    }).get();
};
export default parseFeed;
