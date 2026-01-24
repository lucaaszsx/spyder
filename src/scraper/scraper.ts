import { HttpClientOptions, ScraperOptions } from '../types';
import { defaultOptions, mergeObjects } from '../utils';
import { EventEmitter } from 'node:events';

export class Scraper extends EventEmitter {
    private httpClient: HttpClientOptions;
    private debug: boolean;

    constructor(options: ScraperOptions = defaultOptions) {
        super();

        options = mergeObjects<ScraperOptions>(defaultOptions, options);

        this.httpClient = options.httpClient;
        this.debug = !!options.debug;

        const { backoff } = this.httpClient;

        if (backoff.maxAttempts < 1) backoff.maxAttempts = 1;
    }


}