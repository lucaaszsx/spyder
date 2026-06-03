import type { SpyderSchemaPayload } from '../payload';

export interface SpyderCheckDef {
    kind: string;
    abort: boolean;
}

export abstract class SpyderCheck<T, D extends SpyderCheckDef = SpyderCheckDef> {
    readonly _def: D;

    constructor(def: D) {
        this._def = def;
    }

    get kind(): string {
        return this._def.kind;
    }

    get abort(): boolean {
        return !!this._def.abort;
    }

    abstract run(payload: SpyderSchemaPayload<T>): void;
}
