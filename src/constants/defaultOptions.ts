import type { HttpClientOptions, BackOffOptions } from '../http/types';
import { mergeObjects } from '../utils';
import { HttpError } from '../http';

export const DEFAULT_BACKOFF_OPTIONS: BackOffOptions = {
    enable: true,
    delayFirstAttempt: false,
    jitter: 'none',
    startingDelay: 200,
    baseMultiplier: 2,
    maxDelay: 5000,
    maxAttempts: 5,
    retry: (error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return false;
        if (error instanceof HttpError && error.statusCode >= 400 && error.statusCode < 500)
            return false;

        return true;
    }
};

export const DEFAULT_HTTP_OPTIONS: HttpClientOptions = {
    timeout: 5000,
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8'
    },
    backoff: DEFAULT_BACKOFF_OPTIONS
};

export const DEFAULT_OPTIONS: {
    http?: HttpClientOptions;
    debug?: boolean;
} = {
    http: DEFAULT_HTTP_OPTIONS,
    debug: false
};

export function createOptions<T>(base: T, options: Partial<T>): T {
    return mergeObjects<T>(base, options);
}
