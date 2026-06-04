import { type SpyderCheckDef, SpyderCheck } from './base';
import type { SpyderSchemaPayload } from '../payload';

export interface SpyderCheckMinValueDef extends SpyderCheckDef {
    kind: 'number_min_value';
    minimum: number;
    inclusive: boolean;
}

export interface SpyderCheckMaxValueDef extends SpyderCheckDef {
    kind: 'number_max_value';
    maximum: number;
    inclusive: boolean;
}

export interface SpyderCheckFiniteDef extends SpyderCheckDef {
    kind: 'number_finite';
}

export interface SpyderCheckMultipleOfDef extends SpyderCheckDef {
    kind: 'number_multiple_of';
    divisor: number;
}

export class SpyderCheckMinValue extends SpyderCheck<number, SpyderCheckMinValueDef> {
    constructor(minimum: number, inclusive = true, abort = false) {
        super({ kind: 'number_min_value', minimum, inclusive, abort });
    }

    public run(payload: SpyderSchemaPayload<number>): void {
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

export class SpyderCheckMaxValue extends SpyderCheck<number, SpyderCheckMaxValueDef> {
    constructor(maximum: number, inclusive = true, abort = false) {
        super({ kind: 'number_max_value', maximum, inclusive, abort });
    }

    public run(payload: SpyderSchemaPayload<number>): void {
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

export class SpyderCheckMultipleOf extends SpyderCheck<number, SpyderCheckMultipleOfDef> {
    constructor(divisor: number, abort = false) {
        super({ kind: 'number_multiple_of', divisor, abort });
    }

    public run(payload: SpyderSchemaPayload<number>): void {
        if (payload.value % this._def.divisor === 0) return;

        payload.issue({
            code: 'not_multiple_of',
            message: `Provided number is not a multiple of ${this._def.divisor}`,
            divisor: this._def.divisor,
            input: payload.value
        });
    }
}
