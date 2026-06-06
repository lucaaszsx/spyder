import {
    SpyderCheckFinite,
    SpyderCheckMaxValue,
    SpyderCheckMinValue,
    SpyderCheckMultipleOf
} from '../checks/number';
import { type SpyderSchemaBase, SpyderCoerceableSchemaBase } from '../schema';
import type { SpyderSchemaContext } from '../context';
import type { SpyderExpectedType } from '../errors';
import * as util from '../../utils';

export abstract class SpyderNumericSchemaBase<
    T extends util.Numeric
> extends SpyderCoerceableSchemaBase<T> {
    public abstract readonly kind: util.NumericSchemaKind;
    protected abstract readonly _expectedType: SpyderExpectedType;

    protected abstract _coerce(value: unknown): unknown;
    protected abstract _isValidTypeOf(value: unknown): value is T;

    protected _parse(ctx: SpyderSchemaContext, value: unknown): unknown {
        if (this._def.coerce) value = this._coerce(value);
        if (!this._isValidTypeOf(value))
            ctx.addInvalidType(this._expectedType, util.getParsedType(value), value);

        return value;
    }
}

export abstract class SpyderRangeableNumericSchema<
    T extends util.Numeric
> extends SpyderNumericSchemaBase<T> {
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
        return this._addCheck(new SpyderCheckMultipleOf(divisor, this._zero, abort));
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
        let result = this._clone();

        result = minInclusive ? result.gte(minimum, abort) : result.gt(minimum, abort);
        result = maxInclusive ? result.lte(maximum, abort) : result.lt(maximum, abort);

        return result;
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

    protected override _parse(ctx: SpyderSchemaContext, value: T): unknown {
        const newValue = super._parse(ctx, value);
        if (ctx.hasIssues) return;

        if (this._minValue !== null && (newValue as T) < this._minValue)
            ctx.addTooSmall(
                ({ minimum }) => `The value provided is less than the minimum value of ${minimum}`,
                newValue,
                this._minValue,
                true
            );
        if (this._maxValue !== null && (newValue as T) > this._maxValue)
            ctx.addTooBig(
                ({ maximum }) =>
                    `The value provided is greater than the maximum value of ${maximum}`,
                newValue,
                this._maxValue,
                true
            );

        return newValue;
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
        innerSchema?: SpyderSchemaBase<unknown> | null
    ) {
        super(coerce, innerSchema);
        if (setFiniteCheck) this.finite(true); // todo: fix this
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
            throw new TypeError(
                `Expected divisor to be a bigint, received a ${typeof divisor}: ${String(divisor)}`
            );

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
        switch (typeof value) {
            case 'bigint':
            case 'boolean':
                return true;

            case 'number':
            case 'string': {
                const numeric = Number(value);

                return !isNaN(numeric) && Number.isInteger(numeric);
            }

            case 'symbol':
            case 'undefined':
            case 'object':
            case 'function':
                return false;
        }
    }
}

export class SpyderNaNSchema extends SpyderNumericSchemaBase<number> {
    public readonly kind = 'NaN';
    protected readonly _expectedType = 'NaN';

    protected _coerce(value: unknown): unknown {
        return value;
    }

    protected _isValidTypeOf(value: unknown): value is number {
        return Number.isNaN(value);
    }
}
