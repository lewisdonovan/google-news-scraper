import { Articles } from "./types";
export declare const timeAgo: (date: Date, now?: Date) => string;
declare const parseFeed: (xml: string, now?: Date) => Articles;
export default parseFeed;
