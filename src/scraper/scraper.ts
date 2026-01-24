import { defaultOptions, mergeObjects } from '../utils';
import { EventEmitter } from 'node:events';
import { ScraperOptions } from '../types';
import { Events } from '../constants';
import { HttpClient } from '../http';

export class Scraper extends EventEmitter {
    private httpClient: HttpClient;
    private debug: boolean;

    constructor(options: ScraperOptions = defaultOptions) {
        super();

        options = mergeObjects<ScraperOptions>(defaultOptions, options);

        this.httpClient = new HttpClient(options.httpClient);
        this.debug = !!options.debug;

        if (this.debug)
            this.on(Events.Debug, function(message) {
                // todo: log message
            });
    }


}