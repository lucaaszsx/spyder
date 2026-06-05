import { type SpyderPrimitiveSchemaDef, SpyderPrimitiveSchemaBase } from './base';
import type { SpyderSchemaPayload } from '../payload';
import * as util from '../../utils';

export class SpyderBooleanSchema extends SpyderPrimitiveSchemaBase<boolean> {
    protected _parse(def: SpyderPrimitiveSchemaDef, payload: SpyderSchemaPayload<boolean>): void {
        if (def.coerce) payload.value = Boolean(payload.value);
        if (typeof payload.value !== 'boolean')
            payload.invalidType('boolean', util.getParsedType(payload.value));
    }
}
