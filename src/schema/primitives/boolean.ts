import { SpyderSchema, type SpyderSchemaDef } from '../schema';
import type { SpyderSchemaPayload } from '../payload';
import * as util from '../../utils';

export class SpyderBooleanSchema extends SpyderSchema<boolean> {
    protected _parse(
        def: SpyderSchemaDef,
        payload: SpyderSchemaPayload<boolean>
    ): SpyderSchemaPayload<boolean> {
        if (def.coerce) payload.value = Boolean(payload.value);
        if (typeof payload.value !== 'boolean')
            payload.addInvalidTypeIssue('boolean', util.getParsedType(payload.value));

        return payload;
    }
}
