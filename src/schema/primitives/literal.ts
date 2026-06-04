import { SpyderSchema, type SpyderSchemaDef } from '../schema';
import type { SpyderSchemaPayload } from '../payload';
import * as util from '../../utils';

export class SpyderLiteralSchema extends SpyderSchema<util.Literal> {
    public values: util.LiteralArray = [];

    constructor(...values: util.LiteralArray) {
        if (values.length === 0)
            throw new Error('Cannot create a literal schema without specifying any literal values');

        super(false, null);

        if (values != null) this.values = [values].flat();
    }

    protected _parse(
        _def: SpyderSchemaDef,
        payload: SpyderSchemaPayload<util.Literal>
    ): void {
        if (!this.values.includes(payload.value))
            payload.issue({
                code: 'invalid_value',
                message: `Invalid value provided, expected one of: ${this.values.map(util.parsePrimitive).join(' | ')}`,
                expected: this.values,
                input: payload.value
            });
    }
}
