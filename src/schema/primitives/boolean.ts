import { type SpyderCoerceableSchemaDef, SpyderCoerceableSchemaBase } from '../schema';
import type { SpyderSchemaPayload } from '../payload';
import * as util from '../../utils';

export class SpyderBooleanSchema extends SpyderCoerceableSchemaBase<boolean> {
    protected _parse(def: SpyderCoerceableSchemaDef, payload: SpyderSchemaPayload<boolean>): void {
        if (def.coerce) payload.value = Boolean(payload.value);
        if (typeof payload.value !== 'boolean')
            payload.invalidType('boolean', util.getParsedType(payload.value));
    }
}
