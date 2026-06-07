import { type SpyderCheckDef, SpyderCheck } from './base';
import type { SpyderSchemaContext } from '../context';
import * as util from '../../utils';

export interface SpyderCheckMinValueDef<T extends util.Numeric> extends SpyderCheckDef {
    kind: 'number_min_value';
    minimum: T;
    inclusive: boolean;
}

export interface SpyderCheckMaxValueDef<T extends util.Numeric> extends SpyderCheckDef {
    kind: 'number_max_value';
    maximum: T;
    inclusive: boolean;
}

export interface SpyderCheckFiniteDef extends SpyderCheckDef {
    kind: 'number_finite';
}

export interface SpyderCheckMultipleOfDef<T extends util.Numeric> extends SpyderCheckDef {
    kind: 'number_multiple_of';
    divisor: T;
    zero: T;
}

export class SpyderCheckMinValue<T extends util.Numeric> extends SpyderCheck<
    T,
    SpyderCheckMinValueDef<T>
> {
    constructor(minimum: T, inclusive = true, abort = false) {
        super({ kind: 'number_min_value', minimum, inclusive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: T): void {
        const { minimum, inclusive } = this._def;
        if (inclusive ? value >= minimum : value > minimum) return;

        ctx.addTooSmall(
            ({ comparator, minimum, received }) =>
                `Expected ${comparator} ${minimum}, got ${received}`,
            value,
            minimum,
            inclusive
        );
    }
}

export class SpyderCheckMaxValue<T extends util.Numeric> extends SpyderCheck<
    T,
    SpyderCheckMaxValueDef<T>
> {
    constructor(maximum: T, inclusive = true, abort = false) {
        super({ kind: 'number_max_value', maximum, inclusive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: T): void {
        const { maximum, inclusive } = this._def;
        if (inclusive ? value <= maximum : value < maximum) return;

        ctx.addTooBig(
            ({ comparator, maximum, received }) =>
                `Expected ${comparator} ${maximum}, got ${received}`,
            value,
            maximum,
            inclusive
        );
    }
}

export class SpyderCheckMultipleOf<T extends util.Numeric> extends SpyderCheck<
    T,
    SpyderCheckMultipleOfDef<T>
> {
    constructor(divisor: T, zero: T, abort = false) {
        super({ kind: 'number_multiple_of', divisor, zero, abort });
    }

    public run(ctx: SpyderSchemaContext, value: T): void {
        if (value % this._def.divisor === this._def.zero) return;

        ctx.addIssue({
            code: 'not_multiple_of',
            message: `Provided number is not a multiple of ${util.parsePrimitive(this._def.divisor)}`,
            divisor: this._def.divisor,
            input: value
        });
    }
}

export class SpyderCheckFinite extends SpyderCheck<number, SpyderCheckFiniteDef> {
    constructor(abort = false) {
        super({ kind: 'number_finite', abort });
    }

    public run(ctx: SpyderSchemaContext, value: number): void {
        if (Number.isFinite(value)) return;

        ctx.addIssue({
            code: 'not_finite',
            message: 'Provided value is not a finite number',
            input: value
        });
    }
}
