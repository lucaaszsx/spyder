import type { RequestRedirect } from 'undici';

export interface RequestOptions<Meta = unknown> {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: string | URLSearchParams | Record<string, unknown>;
    accept?: string;
    redirect?: RequestRedirect;
    signal?: AbortSignal;
    responseType?: 'text' | 'json' | 'buffer';
    meta?: Meta;
}

export type BodyOptions<Meta = unknown> = Omit<RequestOptions<Meta>, 'method'>;
export type NoBodyOptions<Meta = unknown> = Omit<RequestOptions<Meta>, 'method' | 'body'>;

export interface RequestResult<ResultBody = string> {
    status: number;
    headers: Record<string, string>;
    body: ResultBody;
    url: string;
}

export interface RequestContext<Meta = unknown> {
    request: {
        readonly url: string;
        readonly method: NonNullable<RequestOptions['method']>;
        headers: Record<string, string>;
        body: string | undefined;
    };
    meta: Meta | undefined;
}

export type PreRequestHook<Meta = unknown> = (
    context: RequestContext<Meta>
) => void | Promise<void>;
export type PostRequestHook<ResultBody = unknown, Meta = unknown> = (
    context: RequestContext<Meta>,
    result: RequestResult<ResultBody>
) => RequestResult<ResultBody> | void | Promise<RequestResult<ResultBody> | void>;

export type JitterType = 'none' | 'full' | null;

export interface BackOffOptions {
    enable: boolean;
    delayFirstAttempt: boolean;
    jitter: JitterType;
    maxDelay: number;
    maxAttempts: number;
    startingDelay: number;
    baseMultiplier: number;
    retry: (error: unknown, attempt: number) => boolean | Promise<boolean>;
}

export interface ProxyOptions {
    url: string;
    auth?: { username: string; password: string };
}

export interface HttpClientOptions {
    timeout: number;
    headers: Record<string, string>;
    backoff: Partial<BackOffOptions>;
    proxy?: Partial<ProxyOptions>;
}
