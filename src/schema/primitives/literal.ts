import { SpyderCoerceableSchemaBase } from '../schema';
import type { SpyderSchemaContext } from '../context';
import * as util from '../../utils';

export class SpyderLiteralSchema extends SpyderCoerceableSchemaBase<util.Literal> {
    public values: Set<util.Literal>;

    constructor(...values: util.LiteralArray) {
        if (!Array.isArray(values) || values.length === 0)
            throw new Error('Cannot create a literal schema without specifying any literal values');

        super(false, null);
        this.values = new Set(values);
    }

    protected _parse(ctx: SpyderSchemaContext, value: util.Literal): util.Literal {
        if (!this.values.has(value))
            ctx.addIssue({
                code: 'invalid_value',
                message: `Invalid value provided, expected one of: ${[...this.values].map(util.parsePrimitive).join(' | ')}`,
                expected: [...this.values],
                input: value
            });

        return value;
    }
}
