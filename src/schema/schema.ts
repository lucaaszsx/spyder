import type { SpyderCheck } from './checks/base';
import { SpyderSchemaPayload } from './payload';
import * as util from '../utils';

interface SpyderSchemaTransformStep {
    kind: 'transform';
    tx: (value: unknown) => unknown;
}

interface SpyderSchemaCheckStep {
    kind: 'check';
    check: SpyderCheck<unknown>;
}

export type SpyderSchemaStep = SpyderSchemaTransformStep | SpyderSchemaCheckStep;

export interface SpyderSchemaDef {
    steps: SpyderSchemaStep[];
    hasCatch: boolean;
    catchValue?: unknown;
    innerSchema: SpyderSchema<unknown> | null;
}

export abstract class SpyderSchema<O> {
    declare readonly _output: O;
    _def: SpyderSchemaDef;

    constructor(innerSchema: SpyderSchema<unknown> | null = null) {
        this._def = {
            steps: [],
            hasCatch: false,
            innerSchema
        };
    }

    public parse(rawValue: unknown): O {
        const value = this._def.innerSchema ? this._def.innerSchema.parse(rawValue) : rawValue;
        const payload = new SpyderSchemaPayload<unknown>(value);
        this._parse(this._def, payload);

        if (!payload.hasIssues) {
            stepLoop: for (const step of this._def.steps) {
                switch (step.kind) {
                    case 'transform':
                        payload.value = step.tx(payload.value);
                        break;

                    case 'check':
                        step.check.run(payload);
                        if (step.check.abort && payload.hasIssues) break stepLoop;
                        break;

                    default:
                        break;
                }
            }
        }

        if (payload.hasIssues) {
            if (this._def.hasCatch) return this._def.catchValue as O;

            const err = new Error(
                `One or more issues found when parsing value: ${String(payload.value)}`
            );
            Object.assign(err, { issues: payload.issues });

            throw err;
        }

        return payload.value as O;
    }

    public catch(value: O): this {
        const clone = this._clone();
        clone._def.hasCatch = true;
        clone._def.catchValue = value;

        return clone;
    }

    protected abstract _parse(def: SpyderSchemaDef, payload: SpyderSchemaPayload<unknown>): void;

    protected _addCheck(check: SpyderCheck<unknown>): this {
        const clone = this._clone();
        clone._def.steps.push({ kind: 'check', check });

        return clone;
    }

    protected _addTransform(tx: (value: O) => O): this {
        const clone = this._clone();
        clone._def.steps.push({ kind: 'transform', tx: tx as (value: unknown) => unknown });

        return clone;
    }

    protected _clone(): this {
        const clone = util.shallowClone(this) as this;
        clone._def = { ...this._def, steps: [...this._def.steps] };

        return clone;
    }
}

export type Infer<T extends SpyderSchema<unknown>> = T['_output'];
