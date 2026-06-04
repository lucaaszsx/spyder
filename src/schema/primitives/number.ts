import {
    SpyderCheckFinite,
    SpyderCheckMaxValue,
    SpyderCheckMinValue,
    SpyderCheckMultipleOf
} from '../checks/number';
import { SpyderSchema, type SpyderSchemaDef } from '../schema';
import type { SpyderSchemaPayload } from '../payload';
import type { SpyderExpectedType } from '../errors';
import * as util from '../../utils';

export abstract class SpyderBaseNumericSchema<T extends util.Numeric> extends SpyderSchema<T> {
    public abstract readonly kind: util.NumericSchemaKind;
    protected abstract readonly _expectedType: SpyderExpectedType;

    protected abstract _coerce(value: unknown): unknown;
    protected abstract _isValidTypeOf(value: unknown): value is T;

    protected _parse(
        def: SpyderSchemaDef,
        payload: SpyderSchemaPayload<unknown>
    ): SpyderSchemaPayload<unknown> {
        if (def.coerce) payload.value = this._coerce(payload.value);
        if (!this._isValidTypeOf(payload.value))
            payload.invalidType(this._expectedType, util.getParsedType(payload.value));

        return payload;
    }
}

export abstract class SpyderRangeableNumericSchema<
    T extends util.Numeric
> extends SpyderBaseNumericSchema<T> {
    protected abstract readonly _minValue: T | null;
    protected abstract readonly _maxValue: T | null;
    protected abstract readonly _zero: T;

    public min(minimum: T, inclusive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMinValue(minimum, inclusive, abort));
    }

    public max(maximum: T, inclusive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMaxValue(maximum, inclusive, abort));
    }

    public multipleOf(divisor: T, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMultipleOf(divisor, abort));
    }

    public gt(minimum: T, abort?: boolean): this {
        return this.min(minimum, false, abort);
    }

    public gte(minimum: T, abort?: boolean): this {
        return this.min(minimum, true, abort);
    }

    public lt(maximum: T, abort?: boolean): this {
        return this.max(maximum, false, abort);
    }

    public lte(maximum: T, abort?: boolean): this {
        return this.max(maximum, true, abort);
    }

    public between(
        minimum: T,
        maximum: T,
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
        return this.gt(this._zero, abort);
    }

    public nonpositive(abort?: boolean): this {
        return this.lte(this._zero, abort);
    }

    public negative(abort?: boolean): this {
        return this.lt(this._zero, abort);
    }

    public nonnegative(abort?: boolean): this {
        return this.gte(this._zero, abort);
    }

    protected override _parse(
        def: SpyderSchemaDef,
        payload: SpyderSchemaPayload<unknown>
    ): SpyderSchemaPayload<unknown> {
        super._parse(def, payload);
        if (payload.hasIssues) return payload;

        const value = payload.value as T;
        if (this._minValue && value < this._minValue)
            payload.tooSmall(
                'The value provided is less than the minimum value of {{minimum}}',
                value,
                this._minValue,
                true
            );
        if (this._maxValue && value > this._maxValue)
            payload.tooBig(
                'The value provided is greater than the maximum value of {{maximum}}',
                value,
                this._maxValue,
                true
            );

        return payload;
    }
}

export class SpyderNumberSchema extends SpyderRangeableNumericSchema<number> {
    public readonly kind = 'number';
    protected readonly _minValue = Number.NEGATIVE_INFINITY;
    protected readonly _maxValue = Number.POSITIVE_INFINITY;
    protected readonly _zero = 0;
    protected readonly _expectedType = 'number';

    constructor(
        setFiniteCheck = true,
        coerce?: boolean,
        innerSchema?: SpyderSchema<unknown> | null
    ) {
        super(coerce, innerSchema);
        if (setFiniteCheck) this.finite(true);
    }

    public finite(abort?: boolean): this {
        return this._addCheck(new SpyderCheckFinite(abort));
    }

    protected _coerce(value: unknown): number {
        return Number(value);
    }

    protected _isValidTypeOf(value: unknown): value is number {
        return typeof value === 'number' && !isNaN(value);
    }
}

export class SpyderIntSchema extends SpyderRangeableNumericSchema<number> {
    public readonly kind = 'int';
    protected readonly _minValue = Number.MIN_SAFE_INTEGER;
    protected readonly _maxValue = Number.MAX_SAFE_INTEGER;
    protected readonly _zero = 0;
    protected readonly _expectedType = 'int';

    protected _coerce(value: unknown): number {
        return Number(value);
    }

    protected _isValidTypeOf(value: unknown): value is number {
        return typeof value === 'number' && !isNaN(value);
    }
}

export class SpyderBigIntSchema extends SpyderRangeableNumericSchema<bigint> {
    public readonly kind = 'bigint';
    protected readonly _minValue = null;
    protected readonly _maxValue = null;
    protected readonly _zero = 0n;
    protected readonly _expectedType = 'bigint';

    public override multipleOf(divisor: bigint, abort?: boolean): this {
        if (typeof divisor !== 'bigint')
            throw new TypeError(`Expected divisor to be a bigint, received ${typeof divisor}`);

        return super.multipleOf(divisor, abort);
    }

    protected _coerce(value: unknown): unknown {
        if (!this._canCoerce(value)) return value;

        return BigInt(value);
    }

    protected _isValidTypeOf(value: unknown): value is bigint {
        return typeof value === 'bigint';
    }

    private _canCoerce(value: unknown): value is string | number | bigint | boolean {
        const typeOf = typeof value;

        return (
            typeOf === 'string' ||
            typeOf === 'number' ||
            typeOf === 'bigint' ||
            typeOf === 'boolean'
        );
    }
}

export class SpyderNaNSchema extends SpyderBaseNumericSchema<number> {
    public readonly kind = 'NaN';
    protected readonly _expectedType = 'NaN';

    protected _coerce(value: unknown): unknown {
        return value;
    }

    protected _isValidTypeOf(value: unknown): value is number {
        return typeof value === 'number' && isNaN(value);
    }
}
