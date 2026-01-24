import { HttpClientOptions } from '../types';
import { UserAgentRotator } from './userAgent';

export class HttpClient {
    private options: HttpClientOptions;
    private uaRotator: UserAgentRotator | null = null;

    constructor(options: HttpClientOptions) {
        this.options = options;

        if (this.rotateUA) this.uaRotator = new UserAgentRotator(options.uaConfig.uaList);
    }

    get rotateUA(): boolean {
        return this.options.uaConfig.rotate;
    }

    get currentUA() {
        const userAgent = this.rotateUA
            ? this.uaRotator?.next()
            : this.options.uaConfig.ua;

        return userAgent || '';
    }

    async get(url: string) {
        return ; // todo
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