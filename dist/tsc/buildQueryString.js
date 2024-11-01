const buildQueryString = (query) => {
    // Bail if there's nothing in the Object
    if (Object.keys(query).length === 0)
        return "";
    // Build query string
    // Example: { q: 'zapatos', gl: 'ES', ceid: "es:es" } => '?q=zapatos&gl=ES&ceid=ES:es'
    const queryString = Object.keys(query).reduce((acc, key, index) => {
        const prefix = index === 0 ? '?' : '&';
        return `${acc}${prefix}${key}=${query[key]}`;
    }, '');
    return queryString;
};
export default buildQueryString;
