import { type SpyderSchemaDef, SpyderSchemaBase } from '../schema';

export interface SpyderPrimitiveSchemaDef extends SpyderSchemaDef {
    coerce: boolean;
}

export abstract class SpyderPrimitiveSchemaBase<O> extends SpyderSchemaBase<O> {
    declare _def: SpyderPrimitiveSchemaDef;

    constructor(coerce = true, innerSchema?: SpyderSchemaBase<unknown> | null) {
        super(innerSchema);

        this._def.coerce = coerce === true;
    }
}
