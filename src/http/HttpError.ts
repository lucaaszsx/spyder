export class HttpError extends Error {
    readonly statusCode: number;
    readonly url: string;

    constructor(statusCode: number, url: string) {
        super(`Request failed with HTTP ${statusCode} at ${url}`);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.url = url;
    }
}
