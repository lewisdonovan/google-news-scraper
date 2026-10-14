declare const mapLimit: <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) => Promise<R[]>;
export default mapLimit;
