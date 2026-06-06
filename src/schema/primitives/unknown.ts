import type { SpyderSchemaContext } from '../context';
import { SpyderSchemaBase } from '../schema';

export class SpyderUnknownSchema extends SpyderSchemaBase<unknown> {
    protected _parse(_payload: SpyderSchemaContext, value: unknown): unknown {
        // Don't do anything, "unknown" schema allows any value
        return value;
    }
}
