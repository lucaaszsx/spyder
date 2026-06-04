import { type SpyderCheckDef, SpyderCheck } from './base';
import type { SpyderSchemaPayload } from '../payload';
import type * as util from '../../utils';

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
}

export class SpyderCheckMinValue<T extends util.Numeric> extends SpyderCheck<
    T,
    SpyderCheckMinValueDef<T>
> {
    constructor(minimum: T, inclusive = true, abort = false) {
        super({ kind: 'number_min_value', minimum, inclusive, abort });
    }

    public run(payload: SpyderSchemaPayload<T>): void {
        const { minimum, inclusive } = this._def;
        const { value } = payload;
        if (inclusive ? value >= minimum : value > minimum) return;

        payload.tooSmall(
            `Expected {{comparator}} {{minimum}}, got {{received}}`,
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

    public run(payload: SpyderSchemaPayload<T>): void {
        const { maximum, inclusive } = this._def;
        const { value } = payload;
        if (inclusive ? value <= maximum : value < maximum) return;

        payload.tooBig(
            `Expected {{comparator}} {{maximum}}, got {{received}}`,
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
    constructor(divisor: T, abort = false) {
        super({ kind: 'number_multiple_of', divisor, abort });
    }

    public run(payload: SpyderSchemaPayload<T>): void {
        if (payload.value % this._def.divisor === 0) return;

        payload.issue({
            code: 'not_multiple_of',
            message: `Provided number is not a multiple of ${this._def.divisor}`,
            divisor: this._def.divisor,
            input: payload.value
        });
    }
}

export class SpyderCheckFinite extends SpyderCheck<number, SpyderCheckFiniteDef> {
    constructor(abort = false) {
        super({ kind: 'number_finite', abort });
    }

    public run(payload: SpyderSchemaPayload<number>): void {
        if (Number.isFinite(payload.value)) return;

        payload.issue({
            code: 'not_finite',
            message: 'Provided value is not a finite number',
            input: payload.value
        });
    }
}
