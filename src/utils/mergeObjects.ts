function isPlainObject(value: any): value is Record<string, any> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
}

export function mergeObjects<T>(
    objA: Record<string, any>,
    objB: Record<string, any>
): T {
    const result: Record<string, any> = { ...objA };

    for (const [ key, valueB ] of Object.entries(objB)) {
        const valueA = result[key];

        if (isPlainObject(valueA) && isPlainObject(valueB)) result[key] = mergeObjects(valueA, valueB);
        else result[key] = valueB;
    }

    return result;
}
