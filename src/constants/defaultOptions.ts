import { ScraperOptions } from '../types/options';

export const defaultOptions: ScraperOptions = {
    httpClient: {
        timeout: 5000,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
            'Connection': 'keep-alive'
        },
        uaConfig: {
            rotate: true,
            uaList: [
                // Chrome (Windows)
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',

                // Chrome (Linux)
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',

                // Chrome (macOS)
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',

                // Firefox (Windows)
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',

                // Firefox (Linux)
                'Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0',

                // Firefox (macOS)
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 13.2; rv:122.0) Gecko/20100101 Firefox/122.0',

                // Edge (Windows)
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',

                // Safari (macOS)
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',

                // Chrome Mobile (Android)
                'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',

                // Safari Mobile (iPhone)
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
            ]
        },
        backoff: {
            enable: true,
            delayFirstAttempt: false,
            jitter: 'none',
            startingDelay: 200, // ms
            baseMultiplier: 2,
            maxDelay: 5000, // ms
            maxAttempts: 5,
            retry: () => true
        }
    },
    debug: false
};
