import { BackOffOptions } from '../types';

function applyDelay(attempt: number, options: BackOffOptions): Promise<any> {
    const baseDelay = options.startingDelay * Math.pow(options.baseMultiplier, attempt);
    let delay = Math.min(baseDelay, options.maxDelay);

    if (options.jitter === 'full')
        delay = Math.round(Math.random() * delay);

    return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function doRetriesWithBackOff<T>(
    fn: () => Promise<T>,
    options: BackOffOptions
): Promise<T> {
    const { delayFirstAttempt } = options;
    let attempt = 0, lastError;

    while (attempt <= options.maxAttempts) {
        try {
             if (!delayFirstAttempt && attempt === 0) return await fn();
             
             let delayedAttempts = attempt;

             if (delayFirstAttempt) delayedAttempts -= 1;

             await applyDelay(delayedAttempts, options);

             return await fn();
        } catch (error) {
            lastError = error;
            attempt++;

            const shouldRetry = await options.retry(error, attempt);

            if (!shouldRetry) throw error;
        }
    }

    throw lastError;
}