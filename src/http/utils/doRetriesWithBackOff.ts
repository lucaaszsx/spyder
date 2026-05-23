import type { BackOffOptions } from '../types';

function computeDelay(attempt: number, options: BackOffOptions): Promise<void> {
    const base = options.startingDelay * Math.pow(options.baseMultiplier, attempt);
    let delay = Math.min(base, options.maxDelay);

    if (options.jitter === 'full') delay = Math.round(Math.random() * delay);

    return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function doRetriesWithBackOff<T>(
    callback: () => Promise<T>,
    options: BackOffOptions
): Promise<T> {
    if (!options.enable) return callback();

    let attempt = 0;
    let lastError: unknown;

    while (attempt <= options.maxAttempts) {
        try {
            if (attempt > 0 || options.delayFirstAttempt) {
                const delayIndex = options.delayFirstAttempt ? attempt : attempt - 1;
                await computeDelay(delayIndex, options);
            }

            return await callback();
        } catch (error) {
            lastError = error;
            attempt++;

            if (attempt > options.maxAttempts) break;

            const shouldRetry = await options.retry(error, attempt);
            if (!shouldRetry) throw error;
        }
    }

    throw lastError;
}
