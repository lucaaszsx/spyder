import { type SpyderSchemaDef, SpyderSchemaBase } from '../schema';
import type { SpyderSchemaPayload } from '../payload';

export class SpyderUnknownSchema extends SpyderSchemaBase<unknown> {
    protected _parse(_def: SpyderSchemaDef, _payload: SpyderSchemaPayload): void {
        // Does not return nothing, "unknown" schema allows any value
        return;
    }
}
