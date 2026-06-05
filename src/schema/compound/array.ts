import { type SpyderCompoundSchemaDef, SpyderCompoundSchemaBase } from './base';
import type { SpyderSchemaPayload } from '../payload';
import type { SpyderSchemaBase } from '../schema';
import * as util from '../../utils';

export class SpyderArraySchema<T = unknown> extends SpyderCompoundSchemaBase<
    T[],
    SpyderSchemaBase<T>
> {
    protected _parse(
        def: SpyderCompoundSchemaDef<SpyderSchemaBase<T>>,
        payload: SpyderSchemaPayload<unknown>
    ): void {
        if (!Array.isArray(payload.value)) {
            payload.invalidType('array', util.getParsedType(payload.value));
            return;
        }

        const path: PropertyKey[] = [];

        payload.value = payload.value.map((element, index) => {
            path.push(index);

            payload.value = element;
            def.shape.parseWithPayload(payload);
        });
        payload.path = path;
    }
}
