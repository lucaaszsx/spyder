export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergeObjects<T extends object = Record<string, unknown>>(
    objA: Partial<T>,
    objB: Partial<T>
): T {
    const result: Record<string, unknown> = { ...objA };

    for (const [key, valueB] of Object.entries(objB)) {
        const valueA = result[key];

        if (isPlainObject(valueA) && isPlainObject(valueB)) {
            result[key] = mergeObjects(valueA, valueB);
        } else {
            result[key] = valueB;
        }
    }

    return result as T;
}

export const isDefined = <T = unknown>(value: T): value is NonNullable<T> => value !== undefined;
export const isFiniteGreaterThanZero = (value: unknown): boolean =>
    typeof value === 'number' && value > 0 && Number.isFinite(value);
export const isFinitePositive = (value: unknown): boolean =>
    typeof value === 'number' && value >= 0 && Number.isFinite(value);
export const matchSome = <T>(value: T, ...options: T[]): boolean => options.includes(value);
export const isBool = (value: unknown): boolean => typeof value === 'boolean';
export const isFunction = (value: unknown): boolean => typeof value === 'function';
export const isStr = (value: unknown): boolean => typeof value === 'string';
