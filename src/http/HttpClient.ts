import type {
    HttpClientOptions,
    PostRequestHook,
    PreRequestHook,
    RequestContext,
    RequestOptions,
    BackOffOptions,
    RequestResult,
    NoBodyOptions,
    ProxyOptions,
    BodyOptions
} from './types';
import { DEFAULT_HTTP_OPTIONS, createOptions } from '../constants';
import { doRetriesWithBackOff } from './utils';
import { isPlainObject } from '../utils';
import { HttpError } from './HttpError';
import { ProxyAgent } from 'undici';

export class HttpClient<Meta = unknown> {
    private readonly timeout: number;
    private readonly headers: Record<string, string>;
    private readonly backoff: BackOffOptions;
    private readonly dispatcher: ProxyAgent | undefined;
    private readonly preHooks: PreRequestHook<Meta>[] = [];
    private readonly postHooks: PostRequestHook<unknown, Meta>[] = [];

    constructor(options?: Partial<HttpClientOptions>) {
        if (options && typeof options !== 'object')
            throw new Error('HttpClient options must be an object or null');

        const { timeout, headers, backoff, proxy } = createOptions<HttpClientOptions>(
            DEFAULT_HTTP_OPTIONS,
            options || {}
        ) as HttpClientOptions & { backoff: BackOffOptions; proxy: ProxyOptions };

        if (isNaN(timeout) || timeout < 0)
            throw new Error(`Option 'timeout' must be a non-negative number. Received: ${timeout}`);

        if (!isPlainObject(headers) || Object.values(headers).some((h) => typeof h !== 'string'))
            throw new Error("Option 'headers' must be a plain object with string values");

        this.timeout = timeout;
        this.headers = headers;
        this.backoff = backoff;
        this.dispatcher = proxy ? this.buildProxyAgent(proxy) : undefined;
    }

    public onRequest(hook: PreRequestHook<Meta>): this {
        this.preHooks.push(hook);
        return this;
    }

    public onResponse<ResultBody>(hook: PostRequestHook<ResultBody, Meta>): this {
        this.postHooks.push((context, result) =>
            hook(context, result as RequestResult<ResultBody>)
        );
        return this;
    }

    public async get<ResultBody>(
        url: string,
        options?: NoBodyOptions<Meta>
    ): Promise<RequestResult<ResultBody>> {
        return this.request<ResultBody>(url, { ...options, method: 'GET' });
    }

    public async post<ResultBody>(
        url: string,
        options?: BodyOptions<Meta>
    ): Promise<RequestResult<ResultBody>> {
        return this.request<ResultBody>(url, { ...options, method: 'POST' });
    }

    public async put<ResultBody>(
        url: string,
        options?: BodyOptions<Meta>
    ): Promise<RequestResult<ResultBody>> {
        return this.request<ResultBody>(url, { ...options, method: 'PUT' });
    }

    public async patch<ResultBody>(
        url: string,
        options?: BodyOptions<Meta>
    ): Promise<RequestResult<ResultBody>> {
        return this.request<ResultBody>(url, { ...options, method: 'PATCH' });
    }

    public async delete<ResultBody>(
        url: string,
        options?: NoBodyOptions<Meta>
    ): Promise<RequestResult<ResultBody>> {
        return this.request<ResultBody>(url, { ...options, method: 'DELETE' });
    }

    private async request<ResultBody = string>(
        url: string,
        options: RequestOptions<Meta> = {}
    ): Promise<RequestResult<ResultBody>> {
        const {
            method = 'GET',
            headers: perRequestHeaders,
            body,
            accept = 'text/html',
            redirect = 'follow',
            responseType = 'text',
            signal: externalSignal,
            meta
        } = options;

        const { resolvedBody, contentType } = this.resolveBody(body);
        const headers: Record<string, string> = {
            ...this.headers,
            Accept: accept,
            ...(contentType ? { 'Content-Type': contentType } : {}),
            ...perRequestHeaders
        };

        const context: RequestContext<Meta> = {
            request: { url, method, headers, body: resolvedBody },
            meta
        };

        for (const hook of this.preHooks) await hook(context);

        let result = (await doRetriesWithBackOff(async () => {
            const timeoutSignal = AbortSignal.timeout(this.timeout);
            const signal = externalSignal
                ? AbortSignal.any([timeoutSignal, externalSignal])
                : timeoutSignal;

            const fetchInit: RequestInit = {
                method: context.request.method,
                headers: context.request.headers,
                body: context.request.body ?? null,
                redirect,
                signal
            };

            if (this.dispatcher)
                (fetchInit as Record<string, unknown>)['dispatcher'] = this.dispatcher;

            const response = await fetch(context.request.url, fetchInit);
            if (!response.ok) throw new HttpError(response.status, context.request.url);

            const responseHeaders = Object.fromEntries(response.headers.entries());
            let parsedBody: unknown;

            if (responseType === 'json') parsedBody = await response.json();
            else if (responseType === 'buffer')
                parsedBody = Buffer.from(await response.arrayBuffer());
            else parsedBody = await response.text();

            return {
                status: response.status,
                headers: responseHeaders,
                body: parsedBody as ResultBody,
                url: response.url
            };
        }, this.backoff)) as RequestResult<ResultBody>;

        for (const hook of this.postHooks) {
            const modified = await hook(context, result);
            if (modified !== undefined) result = modified as RequestResult<ResultBody>;
        }

        return result;
    }

    private resolveBody(body: RequestOptions['body']): {
        resolvedBody: string | undefined;
        contentType: string | undefined;
    } {
        if (body === undefined) return { resolvedBody: undefined, contentType: undefined };
        if (body instanceof URLSearchParams)
            return {
                resolvedBody: body.toString(),
                contentType: 'application/x-www-form-urlencoded'
            };
        if (typeof body === 'string') return { resolvedBody: body, contentType: undefined };

        return { resolvedBody: JSON.stringify(body), contentType: 'application/json' };
    }

    private buildProxyAgent(proxy: ProxyOptions): ProxyAgent {
        const proxyUrl = proxy.auth
            ? proxy.url.replace('://', `://${proxy.auth.username}:${proxy.auth.password}@`)
            : proxy.url;

        return new ProxyAgent(proxyUrl);
    }
}
