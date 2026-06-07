import { type SpyderCheckDef, SpyderCheck } from './base';
import type { SpyderSchemaContext } from '../context';

export interface SpyderCheckMinArrayLengthDef extends SpyderCheckDef {
    kind: 'array_min_length';
    minimum: number;
    inclusive: boolean;
}

export interface SpyderCheckMaxArrayLengthDef extends SpyderCheckDef {
    kind: 'array_max_length';
    maximum: number;
    inclusive: boolean;
}

export class SpyderCheckMinArrayLength<T extends unknown[]> extends SpyderCheck<
    T,
    SpyderCheckMinArrayLengthDef
> {
    constructor(minimum: number, inclusive = true, abort = false) {
        super({ kind: 'array_min_length', minimum, inclusive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: T): void {
        const { minimum, inclusive } = this._def;
        if (inclusive ? value.length >= minimum : value.length > minimum) return;

        ctx.addTooSmall(
            ({ comparator, minimum, received }) =>
                `Expected ${comparator} ${minimum} items, got ${received}`,
            value,
            minimum,
            inclusive,
            value.length
        );
    }
}

export class SpyderCheckMaxArrayLength<T extends unknown[]> extends SpyderCheck<
    T,
    SpyderCheckMaxArrayLengthDef
> {
    constructor(maximum: number, inclusive = true, abort = false) {
        super({ kind: 'array_max_length', maximum, inclusive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: T): void {
        const { maximum, inclusive } = this._def;
        if (inclusive ? value.length <= maximum : value.length < maximum) return;

        ctx.addTooBig(
            ({ comparator, maximum, received }) =>
                `Expected ${comparator} ${maximum} items, got ${received}`,
            value,
            maximum,
            inclusive,
            value.length
        );
    }
}
