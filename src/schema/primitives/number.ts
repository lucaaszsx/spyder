import {
    SpyderCheckFinite,
    SpyderCheckMaxValue,
    SpyderCheckMinValue,
    SpyderCheckMultipleOf
} from '../checks/number';
import { SpyderSchema, type SpyderSchemaDef } from '../schema';
import type { SpyderSchemaPayload } from '../payload';
import * as util from '../../utils';

export class SpyderNumberSchema extends SpyderSchema<number> {
    public get minValue(): number {
        return Number.NEGATIVE_INFINITY;
    }

    public get maxValue(): number {
        return Number.POSITIVE_INFINITY;
    }

    constructor(
        setFiniteCheck = true,
        coerce?: boolean,
        innerSchema?: SpyderSchema<unknown> | null
    ) {
        super(coerce, innerSchema);
        if (setFiniteCheck) this.finite(true);
    }

    public min(minimum: number, inclusive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMinValue(minimum, inclusive, abort));
    }

    public max(maximum: number, inclusive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMaxValue(maximum, inclusive, abort));
    }

    public multipleOf(divisor: number, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMultipleOf(divisor, abort));
    }

    public finite(abort?: boolean): this {
        return this._addCheck(new SpyderCheckFinite(abort));
    }

    public gt(minimum: number, abort?: boolean): this {
        return this.min(minimum, false, abort);
    }

    public gte(minimum: number, abort?: boolean): this {
        return this.min(minimum, true, abort);
    }

    public lt(maximum: number, abort?: boolean): this {
        return this.max(maximum, false, abort);
    }

    public lte(maximum: number, abort?: boolean): this {
        return this.max(maximum, true, abort);
    }

    public between(
        minimum: number,
        maximum: number,
        minInclusive?: boolean,
        maxInclusive?: boolean,
        abort?: boolean
    ): this {
        if (minInclusive) this.gte(minimum, abort);
        else this.gt(minimum, abort);
        if (maxInclusive) this.lte(maximum, abort);
        else this.lt(maximum, abort);

        return this;
    }

    public positive(abort?: boolean): this {
        return this.gt(0, abort);
    }

    public nonpositive(abort?: boolean): this {
        return this.lte(0, abort);
    }

    public negative(abort?: boolean): this {
        return this.lt(0, abort);
    }

    public nonnegative(abort?: boolean): this {
        return this.gte(0, abort);
    }

    protected _parse(
        def: SpyderSchemaDef,
        payload: SpyderSchemaPayload<number>
    ): SpyderSchemaPayload<number> {
        if (def.coerce) payload.value = Number(payload.value);
        if (typeof payload.value !== 'number' || isNaN(payload.value))
            payload.invalidType('number', util.getParsedType(payload.value));
        if (payload.value < this.minValue)
            payload.tooSmall(
                'The value provided is less than the minimum value of {{minimum}}',
                payload.value,
                this.minValue,
                true
            );
        if (payload.value > this.maxValue)
            payload.tooBig(
                'The value provided is greater than the maximum value of {{maximum}}',
                payload.value,
                this.maxValue,
                true
            );

        return payload;
    }
}

export class SpyderIntSchema extends SpyderNumberSchema {
    public override get minValue(): number {
        return Number.MIN_SAFE_INTEGER;
    }

    public override get maxValue(): number {
        return Number.MAX_SAFE_INTEGER;
    }

    constructor(coerce?: boolean, innerSchema?: SpyderSchema<unknown> | null) {
        super(false, coerce, innerSchema);
    }
}

export class SpyderNaNSchema extends SpyderSchema<number> {
    protected _parse(
        _def: SpyderSchemaDef,
        payload: SpyderSchemaPayload<number>
    ): SpyderSchemaPayload<number> {
        if (!Number.isNaN(payload.value))
            payload.invalidType('NaN', util.getParsedType(payload.value));

        return payload;
    }
}
