import { DEFAULT_SCRAPER_OPTIONS, createOptions } from '../constants';
import type { ScraperOptions } from './types';
import { HttpClient } from '../http';

export class Scraper {
    protected readonly http: HttpClient;

    constructor(options: Partial<ScraperOptions> = {}) {
        const resolved = createOptions<ScraperOptions>(DEFAULT_SCRAPER_OPTIONS, options);

        this.http = new HttpClient(resolved.http);
    }
}
