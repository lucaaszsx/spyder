import { SpyderSchemaBase, type SpyderSchemaDef } from '../schema';

export interface SpyderCompoundSchemaDef<Shape> extends SpyderSchemaDef {
    shape: Shape;
}

export abstract class SpyderCompoundSchemaBase<O, Shape> extends SpyderSchemaBase<O> {
    declare _def: SpyderCompoundSchemaDef<Shape>;

    constructor(shape: Shape, innerSchema?: SpyderSchemaBase<unknown> | null) {
        super(innerSchema);
        this._def.shape = shape;
    }
}
