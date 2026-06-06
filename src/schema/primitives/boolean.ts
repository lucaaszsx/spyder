import { SpyderCoerceableSchemaBase } from '../schema';
import type { SpyderSchemaContext } from '../context';
import * as util from '../../utils';

export class SpyderBooleanSchema extends SpyderCoerceableSchemaBase<boolean> {
    protected _parse(ctx: SpyderSchemaContext, value: unknown): unknown {
        if (this._def.coerce) value = Boolean(value);
        if (typeof value !== 'boolean')
            ctx.addInvalidType('boolean', util.getParsedType(value), value);

        return value;
    }
}
