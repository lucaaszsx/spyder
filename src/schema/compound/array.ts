import type { SpyderSchemaContext } from '../context';
import type { SpyderSchemaBase } from '../schema';
import { SpyderCompoundSchemaBase } from './base';
import * as util from '../../utils';

export class SpyderArraySchema<T = unknown> extends SpyderCompoundSchemaBase<
    T[],
    SpyderSchemaBase<T>
> {
    protected _parse(ctx: SpyderSchemaContext, value: T[]): unknown {
        if (!Array.isArray(value)) {
            ctx.addInvalidType('array', util.getParsedType(value), value);
            return;
        }

        const result = [];

        for (let idx = 0; idx < value.length; idx++) {
            const childCtx = ctx.child(idx);
            result[idx] = this._def.shape.run(childCtx, value[idx]);

            if (childCtx.hasIssues) ctx.merge(childCtx);
        }

        return result;
    }
}
