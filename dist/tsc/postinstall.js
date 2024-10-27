import winston from 'winston';
;
(() => {
    const config = {
        levels: {
            info: 0,
        },
        colors: {
            info: 'green'
        }
    };
    winston.addColors(config.colors);
    const logger = winston.createLogger({
        levels: config.levels,
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        transports: [
            new winston.transports.Console()
        ]
    });
    logger.info("📰 Thank you for installing google-news-scraper. Please consider buying me a coffee");
    logger.info("☕️ https://donate.stripe.com/6oE7ue8n57wk4PS7ss");
})();
