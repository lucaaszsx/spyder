import { type SpyderCheckDef, SpyderCheck } from './base';
import type { SpyderSchemaPayload } from '../payload';

export interface SpyderNumberCheckMinValueDef extends SpyderCheckDef {
    kind: 'number_min_value';
    minimum: number;
    inclusive: boolean;
}

export interface SpyderNumberCheckMaxValueDef extends SpyderCheckDef {
    kind: 'number_max_value';
    maximum: number;
    inclusive: boolean;
}

export interface SpyderNumberCheckMultipleOfDef extends SpyderCheckDef {
    kind: 'number_multiple_of';
    divisor: number;
}

export class SpyderNumberCheckMinValue extends SpyderCheck<number, SpyderNumberCheckMinValueDef> {
    constructor(minimum: number, inclusive = true, abort = false) {
        super({ kind: 'number_min_value', minimum, inclusive, abort });
    }

    public run(payload: SpyderSchemaPayload<number>): void {
        const { minimum, inclusive } = this._def;
        const { value } = payload;
        if (inclusive ? value >= minimum : value > minimum) return;

        payload.addTooSmallIssue(
            `Expected {{comparator}} {{minimum}}, got {{received}}`,
            value,
            minimum,
            inclusive
        );
    }
}

export class SpyderNumberCheckMaxValue extends SpyderCheck<number, SpyderNumberCheckMaxValueDef> {
    constructor(maximum: number, inclusive = true, abort = false) {
        super({ kind: 'number_max_value', maximum, inclusive, abort });
    }

    public run(payload: SpyderSchemaPayload<number>): void {
        const { maximum, inclusive } = this._def;
        const { value } = payload;
        if (inclusive ? value <= maximum : value < maximum) return;

        payload.addTooBigIssue(
            `Expected {{comparator}} {{maximum}}, got {{received}}`,
            value,
            maximum,
            inclusive
        );
    }
}

export class SpyderNumberCheckMultipleOf extends SpyderCheck<
    number,
    SpyderNumberCheckMultipleOfDef
> {
    constructor(divisor: number, abort = false) {
        super({ kind: 'number_multiple_of', divisor, abort });
    }

    public run(payload: SpyderSchemaPayload<number>): void {
        if (payload.value % this._def.divisor === 0) return;

        payload.addIssue({
            code: 'not_multiple_of',
            message: `Provided number is not a multiple of ${this._def.divisor}`,
            divisor: this._def.divisor,
            input: payload.value
        });
    }
}
