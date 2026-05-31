import type { WebCrapIssue } from '../errors';

export interface WebCrapCheckDef {
    kind: string;
    abort?: boolean;
}

export interface WebCrapCheckPayload<Value> {
    value: Value;
    issues: WebCrapIssue[];
    path: PropertyKey[];
}

export abstract class WebCrapCheck<T, D extends WebCrapCheckDef = WebCrapCheckDef> {
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

    abstract run(payload: WebCrapCheckPayload<T>): void;
}
