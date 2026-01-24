export type JitterType = 'none' | 'full' | null;

export type BackOffOptions = {
    enable: boolean,
    delayFirstAttempt: boolean,
    jitter: JitterType,
    maxDelay: number,
    maxAttempts: number,
    startingDelay: number,
    baseMultiplier: number
    retry: (error: any, attempt: number) => boolean | Promise<Boolean>,
};

export type UAConfigOptions =
    | {
        rotate: true,
        uaList: string[]
    }
    | {
        rotate: false,
        ua: string
    };

export type HttpClientOptions = {
    timeout: number,
    headers: Record<string, string>,
    uaConfig: UAConfigOptions,
    backoff: BackOffOptions
}

export type ScraperOptions = {
    httpClient: HttpClientOptions,
    debug: boolean
};