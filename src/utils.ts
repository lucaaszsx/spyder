export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type ParsedTypes =
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'
    | 'file'
    | 'date'
    | 'array'
    | 'map'
    | 'set'
    | 'nan'
    | 'null'
    | 'promise';

export const REGEX_PATTERNS = {
    uppercase: /^[^a-z]*$/,
    lowercase: /^[^A-Z]*$/
} as const;

export function makeRegexTest(pattern: keyof typeof REGEX_PATTERNS, str: string): boolean {
    return !!REGEX_PATTERNS[pattern]?.test(str);
}

export function getParsedType(value: unknown): ParsedTypes {
    const type = typeof value;

    switch (type) {
        case 'undefined':
        case 'string':
        case 'number':
        case 'boolean':
        case 'function':
        case 'bigint':
        case 'symbol':
            return type;

        case 'object':
            if (value === null) return 'null';
            if (Array.isArray(value)) return 'array';
            if (value instanceof Map) return 'map';
            if (value instanceof Set) return 'set';
            if (value instanceof Date) return 'date';
            if (value instanceof File) return 'file';

            return 'object';

        default:
            throw new Error(`Cannot parse type of the provided value`);
    }
}

export function slugify(text: string): string {
    return text
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (!isObject(value)) return false;

    const proto: unknown = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

export function mergeObjects<T extends object = Record<string, unknown>>(
    objA: Partial<T>,
    objB: Partial<T>
): T {
    const result: Record<string, unknown> = { ...objA };

    for (const [key, valueB] of Object.entries(objB)) {
        const valueA = result[key];

        if (isPlainObject(valueA) && isPlainObject(valueB))
            result[key] = mergeObjects(valueA, valueB);
        else result[key] = valueB;
    }

    return result as T;
}

export function createObject(obj: object): unknown {
    return Object.create(
        Object.getPrototypeOf(obj) as object | null,
        Object.getOwnPropertyDescriptors(obj)
    );
}

export function shallowClone<T extends object>(obj: T | null): T | null {
    if (obj === null) return null;
    if (Array.isArray(obj)) return [...obj] as T;
    if (obj instanceof Map) return new Map(obj) as T;
    if (obj instanceof Set) return new Set(obj) as T;

    return createObject(obj) as T;
}

export function deepClone(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Map) return new Map([...obj].map(([k, v]) => [deepClone(k), deepClone(v)]));
    if (obj instanceof Set) return new Set([...obj].map(deepClone));

    return Object.keys(obj).reduce(
        (acc, key) => {
            acc[key] = deepClone((obj as Record<string, unknown>)[key]);
            return acc;
        },
        {} as Record<string, unknown>
    );
}

export const isDefined = <T>(value: T): value is NonNullable<T> =>
    value !== undefined && value !== null;
export const isFiniteGreaterThanZero = (value: unknown): boolean =>
    typeof value === 'number' && value > 0 && Number.isFinite(value);
export const isFinitePositive = (value: unknown): boolean =>
    typeof value === 'number' && value >= 0 && Number.isFinite(value);
export const matchSome = <T>(value: T, ...options: T[]): boolean => options.includes(value);
export const isBool = (value: unknown): value is boolean => typeof value === 'boolean';
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
    typeof value === 'function';
export const isStr = (value: unknown): value is string => typeof value === 'string';
