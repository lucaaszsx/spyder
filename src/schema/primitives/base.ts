import { SpyderSchema, type SpyderSchemaDef } from '../schema';

export interface SpyderPrimitiveSchemaDef extends SpyderSchemaDef {
    coerce: boolean;
}

export abstract class SpyderPrimitiveSchemaBase<O> extends SpyderSchema<O> {
    declare _def: SpyderPrimitiveSchemaDef;

    constructor(coerce = true, innerSchema?: SpyderSchema<unknown> | null) {
        super(innerSchema);

        this._def.coerce = coerce === true;
    }
}
