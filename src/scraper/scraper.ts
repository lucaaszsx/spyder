/*import { mergeObjects } from '../utils';
import { defaultOptions } from '../constants';
import { ScraperOptions } from '../types';
import { HttpClient } from '../http';

export class Scraper {
    protected readonly httpClient: HttpClient;
    readonly debug: boolean;

    constructor(options: Partial<ScraperOptions> = {}) {
        const resolved = mergeObjects<ScraperOptions>(defaultOptions, options);

        this.httpClient = new HttpClient(resolved.httpClient);
        this.debug = resolved.debug;
    }
}
*/
