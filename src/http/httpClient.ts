import {
    HttpClientOptions,
    UAConfigOptions,
    BackOffOptions
} from '../types';
import { doRetriesWithBackOff, isPlainObject } from '../utils';
import { UserAgentRotator } from './userAgent';

export class HttpClient {
    private timeout: number;
    private headers: Record<string, string>;
    private uaConfig: UAConfigOptions;
    private backoff: BackOffOptions;
    private uaRotator: UserAgentRotator | null = null;

    constructor(options: HttpClientOptions) {
        const { timeout, headers, uaConfig, backoff } = options;

        if (isNaN(timeout) || timeout < 0) throw new Error(
            'Option \'timeout\' of HttpClient must be a number greater than 0. Received: ' +
            timeout
        );

        if (
            !isPlainObject(headers) ||
            Object.values(headers).some((header) => typeof header !== 'string')
        ) throw new Error('Option \'headers\' must be a plain object with string values');
         
        this.timeout = timeout;
        this.headers = headers;
        this.uaConfig = uaConfig;
        this.backoff = backoff;

        if (uaConfig.rotate) this.uaRotator = new UserAgentRotator(uaConfig.uaList);
    }

    get currentUA() {
        if (this.uaConfig.rotate) return this.uaRotator?.next() ?? '';

        return this.uaConfig.ua;
    }

    async get(url: string) {
        
    }

    private async request(url: string) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': this.currentUA,
                'Accept': 'text/html'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok)
            throw new Error(`Couldn't complete request operation: HTTP ${response.status}`);

        return response.text();
    }
}