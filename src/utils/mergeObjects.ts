import { isPlainObject } from './isPlainObject';

export function mergeObjects<T = Record<string, any>>(objA: Partial<T>, objB: Partial<T>): T {
    const result: Record<string, any> = { ...objA };

    for (const [key, valueB] of Object.entries(objB)) {
        const valueA = result[key];

        if (isPlainObject(valueA) && isPlainObject(valueB))
            result[key] = mergeObjects(valueA, valueB);
        else result[key] = valueB;
    }

    return result as T;
}
